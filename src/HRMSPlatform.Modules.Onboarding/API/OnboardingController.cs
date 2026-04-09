using HRMSPlatform.Modules.Onboarding.Application.Commands;
using HRMSPlatform.Modules.Onboarding.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Onboarding.API;

[ApiController]
[Route("api/v1/onboarding")]
[Authorize]
public sealed class OnboardingController(
    IMediator mediator,
    OnboardingDbContext db,
    ITenantContext tenant) : ControllerBase
{
    // ─── Templates ──────────────────────────────────────────────────────────

    /// <summary>List onboarding templates for the tenant.</summary>
    [HttpGet("templates")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> ListTemplates(CancellationToken ct)
    {
        var templates = await db.Templates
            .Where(t => t.TenantId == tenant.TenantId)
            .Select(t => new { t.Id, t.Name, t.IsDefault, taskCount = t.Tasks.Count })
            .ToListAsync(ct);
        return Ok(templates);
    }

    /// <summary>Create a new onboarding template.</summary>
    [HttpPost("templates")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> CreateTemplate(
        [FromBody] CreateOnboardingTemplateCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd, ct);
        return result.IsSuccess
            ? Created($"api/v1/onboarding/templates/{result.Value}", new { id = result.Value })
            : BadRequest(new { error = result.Error.Description });
    }

    // ─── Instances ──────────────────────────────────────────────────────────

    /// <summary>Start onboarding for an employee.</summary>
    [HttpPost("start")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> Start([FromBody] StartOnboardingCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd, ct);
        return result.IsSuccess
            ? Created($"api/v1/onboarding/instances/{result.Value}", new { id = result.Value })
            : BadRequest(new { error = result.Error.Description });
    }

    /// <summary>Get onboarding instance details including tasks.</summary>
    [HttpGet("instances/{instanceId:guid}")]
    public async Task<IActionResult> GetInstance(Guid instanceId, CancellationToken ct)
    {
        var instance = await db.Instances
            .Include(i => i.Tasks)
            .Where(i => i.TenantId == tenant.TenantId && i.Id == instanceId)
            .FirstOrDefaultAsync(ct);

        return instance is null ? NotFound() : Ok(instance);
    }

    /// <summary>Get all onboarding instances for an employee.</summary>
    [HttpGet("employees/{employeeId:guid}")]
    public async Task<IActionResult> GetByEmployee(Guid employeeId, CancellationToken ct)
    {
        var instances = await db.Instances
            .Include(i => i.Tasks)
            .Where(i => i.TenantId == tenant.TenantId && i.EmployeeId == employeeId)
            .OrderByDescending(i => i.StartedAt)
            .ToListAsync(ct);
        return Ok(instances);
    }

    /// <summary>Mark an onboarding task as complete.</summary>
    [HttpPost("instances/{instanceId:guid}/tasks/{taskId:guid}/complete")]
    public async Task<IActionResult> CompleteTask(
        Guid instanceId, Guid taskId,
        [FromBody] CompleteTaskRequest req,
        CancellationToken ct)
    {
        var cmd = new CompleteOnboardingTaskCommand(instanceId, taskId, req.Notes, req.CompletionData);
        var result = await mediator.Send(cmd, ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(new { error = result.Error.Description });
    }
}

public record CompleteTaskRequest(string? Notes, string? CompletionData);
