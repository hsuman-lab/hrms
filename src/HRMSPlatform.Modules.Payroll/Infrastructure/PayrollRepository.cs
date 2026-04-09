using HRMSPlatform.Modules.Payroll.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Payroll.Infrastructure;

public interface IPayrollRepository
{
    Task<PayrollRun?> GetRunAsync(Guid runId, CancellationToken ct = default);
    Task<PayrollRun?> FindRunAsync(Guid tenantId, DateOnly periodStart, CancellationToken ct = default);
    Task<List<PayrollEntry>> GetEntriesAsync(Guid runId, CancellationToken ct = default);
    Task<PayrollEntry?> GetEntryAsync(Guid runId, Guid employeeId, CancellationToken ct = default);
    Task<SalaryStructure?> GetDefaultStructureAsync(Guid tenantId, CancellationToken ct = default);
    Task AddRunAsync(PayrollRun run, CancellationToken ct = default);
    Task AddEntriesAsync(List<PayrollEntry> entries, CancellationToken ct = default);
}

public interface IUnitOfWorkPayroll
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>
/// Adapter: fetches employee payroll input data (CTC, LOP days, overtime) from the
/// Employee + Attendance + Leave modules via service interface.
/// </summary>
public interface IEmployeePayrollDataService
{
    Task<List<EmployeePayrollInput>> GetActiveEmployeesForPayrollAsync(Guid tenantId, CancellationToken ct = default);
}

public sealed record EmployeePayrollInput(
    Guid EmployeeId,
    decimal AnnualCTC,
    decimal LopDays,
    decimal WorkingDays,
    decimal OvertimeHours,
    decimal Reimbursements,
    string State,
    string TaxRegime);

public sealed class PayrollRepository(PayrollDbContext db)
    : IPayrollRepository, IUnitOfWorkPayroll
{
    public Task<PayrollRun?> GetRunAsync(Guid runId, CancellationToken ct = default) =>
        db.PayrollRuns.FirstOrDefaultAsync(r => r.Id == runId, ct);

    public Task<PayrollRun?> FindRunAsync(Guid tenantId, DateOnly periodStart, CancellationToken ct = default) =>
        db.PayrollRuns.FirstOrDefaultAsync(
            r => r.TenantId == tenantId && r.PeriodStart == periodStart, ct);

    public Task<List<PayrollEntry>> GetEntriesAsync(Guid runId, CancellationToken ct = default) =>
        db.PayrollEntries.Where(e => e.RunId == runId).ToListAsync(ct);

    public Task<PayrollEntry?> GetEntryAsync(Guid runId, Guid employeeId, CancellationToken ct = default) =>
        db.PayrollEntries.FirstOrDefaultAsync(e => e.RunId == runId && e.EmployeeId == employeeId, ct);

    public Task<SalaryStructure?> GetDefaultStructureAsync(Guid tenantId, CancellationToken ct = default) =>
        db.SalaryStructures.FirstOrDefaultAsync(s => s.TenantId == tenantId && s.IsDefault, ct);

    public async Task AddRunAsync(PayrollRun run, CancellationToken ct = default) =>
        await db.PayrollRuns.AddAsync(run, ct);

    public async Task AddEntriesAsync(List<PayrollEntry> entries, CancellationToken ct = default) =>
        await db.PayrollEntries.AddRangeAsync(entries, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}
