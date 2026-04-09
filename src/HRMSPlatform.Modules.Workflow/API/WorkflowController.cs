using HRMSPlatform.Modules.Workflow.Application.Commands;
using HRMSPlatform.Modules.Workflow.Domain;
using HRMSPlatform.Modules.Workflow.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Workflow.API;

[ApiController]
[Route("api/v1/workflow")]
[Authorize]
public sealed class WorkflowController(
    IMediator mediator,
    WorkflowDbContext db,
    ITenantContext tenant) : ControllerBase
{
    // ─── Definitions ────────────────────────────────────────────────────────

    /// <summary>List all workflow definitions for the tenant.</summary>
    [HttpGet("definitions")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> ListDefinitions(CancellationToken ct)
    {
        var defs = await db.Definitions
            .Where(d => d.TenantId == tenant.TenantId)
            .Select(d => new { d.Id, d.Name, d.Trigger, d.IsActive, d.Version, d.CreatedAt })
            .ToListAsync(ct);
        return Ok(defs);
    }

    /// <summary>Create a new workflow definition.</summary>
    [HttpPost("definitions")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> CreateDefinition(
        [FromBody] CreateWorkflowDefinitionCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd, ct);
        return result.IsSuccess
            ? Created($"api/v1/workflow/definitions/{result.Value}", new { id = result.Value })
            : BadRequest(new { error = result.Error.Description });
    }

    // ─── Instances ──────────────────────────────────────────────────────────

    /// <summary>Get a workflow instance with its tasks.</summary>
    [HttpGet("instances/{instanceId:guid}")]
    public async Task<IActionResult> GetInstance(Guid instanceId, CancellationToken ct)
    {
        var instance = await db.Instances
            .Where(i => i.TenantId == tenant.TenantId && i.Id == instanceId)
            .Select(i => new
            {
                i.Id, i.EntityType, i.EntityId, i.Status,
                i.CurrentStep, i.CreatedAt, i.CompletedAt,
                tasks = db.Tasks
                    .Where(t => t.InstanceId == instanceId)
                    .Select(t => new { t.Id, t.Step, t.AssigneeId, t.AssigneeType, t.Status, t.DueAt })
                    .ToList()
            })
            .FirstOrDefaultAsync(ct);

        return instance is null ? NotFound() : Ok(instance);
    }

    // ─── Tasks (Approver Inbox) ──────────────────────────────────────────────

    /// <summary>My pending approval tasks.</summary>
    [HttpGet("my-tasks")]
    public async Task<IActionResult> MyTasks(CancellationToken ct)
    {
        var actorId = GetActorId();
        if (actorId == Guid.Empty) return Unauthorized();

        var tasks = await db.Tasks
            .Where(t => t.TenantId == tenant.TenantId &&
                        t.AssigneeId == actorId &&
                        t.Status == WorkflowTaskStatus.Pending)
            .OrderBy(t => t.DueAt)
            .Select(t => new
            {
                t.Id, t.InstanceId, t.Step, t.AssigneeType, t.DueAt,
                instance = db.Instances
                    .Where(i => i.Id == t.InstanceId)
                    .Select(i => new { i.EntityType, i.EntityId })
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        return Ok(tasks);
    }

    /// <summary>Approve a workflow task.</summary>
    [HttpPost("tasks/{taskId:guid}/approve")]
    public async Task<IActionResult> Approve(Guid taskId, [FromBody] ActionRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new ApproveWorkflowTaskCommand(taskId, req.Comments), ct);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error.Description });
    }

    /// <summary>Reject a workflow task.</summary>
    [HttpPost("tasks/{taskId:guid}/reject")]
    public async Task<IActionResult> Reject(Guid taskId, [FromBody] ActionRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Comments))
            return BadRequest(new { error = "Rejection reason is required." });

        var result = await mediator.Send(new RejectWorkflowTaskCommand(taskId, req.Comments!), ct);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error.Description });
    }

    /// <summary>Delegate a workflow task to another user.</summary>
    [HttpPost("tasks/{taskId:guid}/delegate")]
    public async Task<IActionResult> Delegate(Guid taskId, [FromBody] DelegateRequest req, CancellationToken ct)
    {
        var task = await db.Tasks.FindAsync([taskId], ct);
        if (task is null || task.TenantId != tenant.TenantId) return NotFound();
        if (task.Status != WorkflowTaskStatus.Pending)
            return BadRequest(new { error = "Task is not in pending state." });

        task.Delegate(req.NewAssigneeId);
        await db.SaveChangesAsync(ct);
        return Ok();
    }

    private Guid GetActorId()
    {
        var claim = User.FindFirst("sub") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim?.Value, out var id) ? id : Guid.Empty;
    }
}

public record ActionRequest(string? Comments);
public record DelegateRequest(Guid NewAssigneeId);
