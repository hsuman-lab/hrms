using HRMSPlatform.Modules.Payroll.Application.Commands;
using HRMSPlatform.Modules.Payroll.Domain;
using HRMSPlatform.Modules.Payroll.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.Payroll.API;

[ApiController]
[Route("api/v1/payroll")]
[Authorize]
public sealed class PayrollController(ISender mediator, IPayrollRepository repo) : ControllerBase
{
    /// <summary>Initiate a new payroll run (creates in Draft status).</summary>
    [HttpPost("runs")]
    [Authorize(Roles = "PAYROLL_ADMIN")]
    [ProducesResponseType(201)]
    public async Task<IActionResult> Initiate([FromBody] InitiateRunRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(
            new InitiatePayrollRunCommand(req.PeriodStart, req.PeriodEnd, req.RunType), ct);
        return result.IsFailure
            ? Conflict(new { error = result.Error.Description })
            : Created($"api/v1/payroll/runs/{result.Value}", new { runId = result.Value });
    }

    /// <summary>Compute all employee payrolls for the run. Long-running — async.</summary>
    [HttpPost("runs/{runId:guid}/process")]
    [Authorize(Roles = "PAYROLL_ADMIN")]
    [ProducesResponseType(typeof(PayrollRunSummaryDto), 200)]
    public async Task<IActionResult> Process(Guid runId, CancellationToken ct)
    {
        var result = await mediator.Send(new ProcessPayrollRunCommand(runId), ct);
        return result.IsFailure
            ? BadRequest(new { error = result.Error.Description })
            : Ok(result.Value);
    }

    /// <summary>Approve the payroll run (maker-checker). Locks the run.</summary>
    [HttpPost("runs/{runId:guid}/approve")]
    [Authorize(Roles = "PAYROLL_ADMIN,HR_ADMIN")]
    public async Task<IActionResult> Approve(Guid runId, CancellationToken ct)
    {
        var approverId = GetCurrentUserId();
        var result = await mediator.Send(new ApprovePayrollRunCommand(runId, approverId), ct);
        return result.IsFailure ? BadRequest(new { error = result.Error.Description }) : NoContent();
    }

    /// <summary>Get a payroll run with its status and totals.</summary>
    [HttpGet("runs/{runId:guid}")]
    [Authorize(Roles = "PAYROLL_ADMIN,HR_ADMIN")]
    public async Task<IActionResult> GetRun(Guid runId, CancellationToken ct)
    {
        var run = await repo.GetRunAsync(runId, ct);
        return run is null ? NotFound() : Ok(run);
    }

    /// <summary>Get all payroll entries for a run (preview before approve).</summary>
    [HttpGet("runs/{runId:guid}/entries")]
    [Authorize(Roles = "PAYROLL_ADMIN")]
    public async Task<IActionResult> GetEntries(Guid runId, CancellationToken ct)
    {
        var entries = await repo.GetEntriesAsync(runId, ct);
        return Ok(entries.Select(e => new
        {
            e.EmployeeId, e.GrossSalary, e.NetSalary, e.LopDays, e.LopAmount,
            e.Reimbursements, e.PaymentStatus
        }));
    }

    /// <summary>Get a specific employee's payslip data for a run.</summary>
    [HttpGet("payslips/{employeeId:guid}")]
    public async Task<IActionResult> GetPayslip(
        Guid employeeId,
        [FromQuery] Guid runId,
        CancellationToken ct)
    {
        var entry = await repo.GetEntryAsync(runId, employeeId, ct);
        return entry is null ? NotFound() : Ok(entry);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}

public record InitiateRunRequest(
    DateOnly PeriodStart,
    DateOnly PeriodEnd,
    PayrollRunType RunType = PayrollRunType.Regular);
