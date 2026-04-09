using HRMSPlatform.Modules.TenantManagement.Application.Commands;
using HRMSPlatform.Modules.TenantManagement.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.TenantManagement.API;

[ApiController]
[Route("platform-admin/tenants")]
[Authorize(Policy = "PlatformAdmin")]
public sealed class TenantsController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(TenantDto), 201)]
    public async Task<IActionResult> Create([FromBody] CreateTenantRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CreateTenantCommand(req.Slug, req.DisplayName, req.Region, req.PlanId, req.IsTrial), ct);

        return result.IsFailure
            ? Conflict(new { error = result.Error.Description })
            : CreatedAtAction(nameof(GetById), new { tenantId = result.Value.Id }, result.Value);
    }

    [HttpGet("{tenantId:guid}")]
    [ProducesResponseType(typeof(TenantDto), 200)]
    public async Task<IActionResult> GetById(Guid tenantId, CancellationToken ct)
    {
        var result = await mediator.Send(new GetTenantByIdQuery(tenantId), ct);
        return result.IsFailure ? NotFound() : Ok(result.Value);
    }

    [HttpPost("{tenantId:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid tenantId, [FromBody] SuspendRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new SuspendTenantCommand(tenantId, req.Reason), ct);
        return result.IsFailure ? NotFound() : NoContent();
    }
}

public record CreateTenantRequest(string Slug, string DisplayName, string Region, Guid PlanId, bool IsTrial = true);
public record SuspendRequest(string Reason);
