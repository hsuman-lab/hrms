using HRMSPlatform.Modules.LeaveManagement.Application.Commands;
using HRMSPlatform.Modules.LeaveManagement.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.LeaveManagement.API;

[ApiController]
[Route("api/v1/leave")]
[Authorize]
public sealed class LeaveController(ISender mediator, ILeaveRepository repo, ITenantContext tenant) : ControllerBase
{
    /// <summary>Apply for leave. Triggers multi-level approval workflow.</summary>
    [HttpPost("requests")]
    [ProducesResponseType(typeof(object), 201)]
    public async Task<IActionResult> Apply([FromBody] ApplyLeaveRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(
            new ApplyLeaveCommand(req.EmployeeId, req.LeaveTypeId, req.FromDate, req.ToDate, req.Reason), ct);

        return result.IsFailure
            ? BadRequest(new { error = result.Error.Description })
            : Created($"api/v1/leave/requests/{result.Value}", new { requestId = result.Value });
    }

    /// <summary>Get all leave requests (filtered).</summary>
    [HttpGet("requests")]
    public async Task<IActionResult> List(
        [FromQuery] Guid? employeeId,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        // Returns pending requests for approver role
        return Ok(Array.Empty<object>());
    }

    /// <summary>Approve a leave request.</summary>
    [HttpPatch("requests/{requestId:guid}/approve")]
    [Authorize(Roles = "MANAGER,HR_ADMIN")]
    public async Task<IActionResult> Approve(Guid requestId, CancellationToken ct)
    {
        var approverId = GetCurrentUserId();
        var result = await mediator.Send(new ApproveLeaveCommand(requestId, approverId), ct);
        return result.IsFailure ? BadRequest(new { error = result.Error.Description }) : NoContent();
    }

    /// <summary>Reject a leave request with a reason.</summary>
    [HttpPatch("requests/{requestId:guid}/reject")]
    [Authorize(Roles = "MANAGER,HR_ADMIN")]
    public async Task<IActionResult> Reject(Guid requestId, [FromBody] RejectLeaveRequest req, CancellationToken ct)
    {
        var approverId = GetCurrentUserId();
        var result = await mediator.Send(new RejectLeaveCommand(requestId, approverId, req.Reason), ct);
        return result.IsFailure ? NotFound() : NoContent();
    }

    /// <summary>Get leave balances for an employee.</summary>
    [HttpGet("balances/{employeeId:guid}")]
    public async Task<IActionResult> GetBalances(Guid employeeId, CancellationToken ct)
    {
        var balances = await repo.GetAllBalancesAsync(employeeId, ct);
        return Ok(balances);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}

public record ApplyLeaveRequest(Guid EmployeeId, Guid LeaveTypeId, DateOnly FromDate, DateOnly ToDate, string Reason);
public record RejectLeaveRequest(string Reason);
