using System.Text.Json;
using HRMSPlatform.Modules.Payroll.Application.Compliance;
using HRMSPlatform.Modules.Payroll.Application.FormulaEngine;
using HRMSPlatform.Modules.Payroll.Domain;
using HRMSPlatform.Modules.Payroll.Domain.Events;
using HRMSPlatform.Modules.Payroll.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Modules.Payroll.Application.Commands;

public record InitiatePayrollRunCommand(
    DateOnly PeriodStart,
    DateOnly PeriodEnd,
    PayrollRunType RunType = PayrollRunType.Regular) : IRequest<Result<Guid>>;

public record ProcessPayrollRunCommand(Guid RunId) : IRequest<Result<PayrollRunSummaryDto>>;

public record ApprovePayrollRunCommand(Guid RunId, Guid ApproverId) : IRequest<Result>;

public record PayrollRunSummaryDto(
    Guid RunId, string Status, int EmployeeCount,
    decimal TotalGross, decimal TotalNet, DateTime ProcessedAt);

public sealed class InitiatePayrollRunHandler(
    IPayrollRepository repo,
    IUnitOfWorkPayroll uow,
    HRMSPlatform.SharedKernel.MultiTenancy.ITenantContext tenant)
    : IRequestHandler<InitiatePayrollRunCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(InitiatePayrollRunCommand cmd, CancellationToken ct)
    {
        // Idempotency — one run per period
        var existing = await repo.FindRunAsync(tenant.TenantId, cmd.PeriodStart, ct);
        if (existing is not null)
            return Result.Failure<Guid>(Error.Conflict);

        var run = PayrollRun.Create(tenant.TenantId, cmd.PeriodStart, cmd.PeriodEnd,
            cmd.RunType, Guid.Empty);
        await repo.AddRunAsync(run, ct);
        await uow.SaveChangesAsync(ct);
        return run.Id;
    }
}

public sealed class ProcessPayrollRunHandler(
    IPayrollRepository repo,
    IEmployeePayrollDataService empData,
    PayrollFormulaEngine formulaEngine,
    IEnumerable<ICompliancePlugin> compliancePlugins,
    IUnitOfWorkPayroll uow,
    IEventBus eventBus,
    ILogger<ProcessPayrollRunHandler> logger)
    : IRequestHandler<ProcessPayrollRunCommand, Result<PayrollRunSummaryDto>>
{
    public async Task<Result<PayrollRunSummaryDto>> Handle(ProcessPayrollRunCommand cmd, CancellationToken ct)
    {
        var run = await repo.GetRunAsync(cmd.RunId, ct);
        if (run is null) return Result.Failure<PayrollRunSummaryDto>(Error.NotFound);
        if (run.Status != PayrollRunStatus.Draft)
            return Result.Failure<PayrollRunSummaryDto>(
                Error.Custom("PAYROLL_NOT_DRAFT", "Run is not in draft state."));

        run.MarkProcessing();
        await uow.SaveChangesAsync(ct);

        var employees = await empData.GetActiveEmployeesForPayrollAsync(run.TenantId, ct);
        var structure = await repo.GetDefaultStructureAsync(run.TenantId, ct);
        var components = ParseComponents(structure?.Components ?? DefaultIndiaComponents());
        var entries = new List<PayrollEntry>();

        foreach (var emp in employees)
        {
            try
            {
                var context = new PayrollContext(
                    emp.EmployeeId, emp.AnnualCTC, emp.LopDays,
                    emp.WorkingDays, emp.OvertimeHours, emp.Reimbursements,
                    emp.State, emp.TaxRegime);

                // Formula engine computes gross + net
                var result = formulaEngine.Compute(components, context);

                // Compliance plug-ins add statutory deductions
                var compCtx = new ComplianceContext(emp.EmployeeId, result.Earnings.GetValueOrDefault("BASIC"),
                    result.Gross, emp.State, result.Gross <= 21000, emp.TaxRegime);

                var statutory = new Dictionary<string, decimal>();
                foreach (var plugin in compliancePlugins.Where(p => p.IsApplicable(compCtx)))
                {
                    foreach (var kv in plugin.ComputeStatutoryDeductions(compCtx))
                        statutory[kv.Key] = kv.Value;
                }

                var totalStatutory = statutory.Values.Sum();
                var netSalary = result.Net - totalStatutory;

                var allDeductions = result.Deductions.Concat(statutory).ToDictionary(x => x.Key, x => x.Value);

                var entry = new PayrollEntry
                {
                    RunId = run.Id,
                    TenantId = run.TenantId,
                    EmployeeId = emp.EmployeeId,
                    GrossSalary = result.Gross,
                    NetSalary = Math.Max(0, netSalary),
                    LopDays = context.LopDays,
                    LopAmount = result.LopAmount,
                    Reimbursements = context.Reimbursements,
                    Earnings = JsonSerializer.Serialize(result.Earnings),
                    Deductions = JsonSerializer.Serialize(allDeductions),
                    ComputationLog = JsonSerializer.Serialize(result.ComputationLog)
                };

                entries.Add(entry);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Payroll computation failed for employee {EmployeeId}", emp.EmployeeId);
            }
        }

        await repo.AddEntriesAsync(entries, ct);
        run.MarkReview(entries.Sum(e => e.GrossSalary), entries.Sum(e => e.NetSalary), entries.Count);
        await uow.SaveChangesAsync(ct);

        await eventBus.PublishAsync(new PayrollProcessedIntegrationEvent(
            run.TenantId, run.Id, run.PeriodStart, run.PeriodEnd,
            run.TotalGross, run.TotalNet, run.EmployeeCount), ct);

        return new PayrollRunSummaryDto(run.Id, run.Status.ToString(), run.EmployeeCount,
            run.TotalGross, run.TotalNet, run.ProcessedAt ?? DateTime.UtcNow);
    }

    private static List<SalaryComponent> ParseComponents(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<SalaryComponent>>(json) ?? DefaultComponents();
        }
        catch { return DefaultComponents(); }
    }

    private static string DefaultIndiaComponents() => JsonSerializer.Serialize(DefaultComponents());

    private static List<SalaryComponent> DefaultComponents() =>
    [
        new("BASIC",       "Basic Salary",       "earning",    "CTC * 0.40",           true,  true,  1,  null),
        new("HRA",         "House Rent Allowance","earning",   "BASIC * 0.40",          true,  true,  2,  ["BASIC"]),
        new("DA",          "Dearness Allowance",  "earning",   "BASIC * 0.10",          true,  false, 3,  ["BASIC"]),
        new("SPECIAL",     "Special Allowance",   "earning",   "CTC - BASIC - HRA - DA","true", false, 4,  ["BASIC","HRA","DA"]),
        new("PF_EMPLOYEE", "PF (Employee)",       "deduction", "0.12 * min(BASIC, 15000)", false, true, 5, ["BASIC"]),
        new("PROFESSIONAL_TAX","Professional Tax","statutory", "slab:MH_PT",            false, true,  6,  ["GROSS"]),
        new("TDS",         "Income Tax (TDS)",    "deduction", "0",                      false, true,  7,  ["GROSS"]),
    ];
}

public sealed class ApprovePayrollRunHandler(
    IPayrollRepository repo,
    IUnitOfWorkPayroll uow,
    IEventBus eventBus) : IRequestHandler<ApprovePayrollRunCommand, Result>
{
    public async Task<Result> Handle(ApprovePayrollRunCommand cmd, CancellationToken ct)
    {
        var run = await repo.GetRunAsync(cmd.RunId, ct);
        if (run is null) return Result.Failure(Error.NotFound);
        if (run.Status != PayrollRunStatus.Review)
            return Result.Failure(Error.Custom("PAYROLL_NOT_IN_REVIEW", "Run must be in Review status."));

        run.Approve(cmd.ApproverId);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
