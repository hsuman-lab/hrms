using HRMSPlatform.Modules.Audit.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Audit.API;

[ApiController]
[Route("api/v1/audit")]
[Authorize(Roles = "HR_ADMIN")]
public sealed class AuditController(AuditDbContext db, ITenantContext tenant) : ControllerBase
{
    /// <summary>Query immutable audit trail with filters.</summary>
    [HttpGet("events")]
    public async Task<IActionResult> List(
        [FromQuery] string? resourceType,
        [FromQuery] Guid? resourceId,
        [FromQuery] Guid? actorId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var q = db.AuditEvents.Where(e => e.TenantId == tenant.TenantId);
        if (!string.IsNullOrEmpty(resourceType)) q = q.Where(e => e.ResourceType == resourceType);
        if (resourceId.HasValue) q = q.Where(e => e.ResourceId == resourceId);
        if (actorId.HasValue) q = q.Where(e => e.ActorId == actorId);
        if (from.HasValue) q = q.Where(e => e.CreatedAt >= from);
        if (to.HasValue) q = q.Where(e => e.CreatedAt <= to);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(e => e.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(e => new
            {
                e.Id, e.ActorId, e.ActorType, e.Action, e.ResourceType,
                e.ResourceId, e.IpAddress, e.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    /// <summary>Verify hash chain integrity for a tenant's audit log.</summary>
    [HttpGet("verify-integrity")]
    public async Task<IActionResult> VerifyIntegrity(CancellationToken ct)
    {
        var events = await db.AuditEvents
            .Where(e => e.TenantId == tenant.TenantId)
            .OrderBy(e => e.Id)
            .Select(e => new { e.Id, e.Hash, e.Action, e.ResourceId, e.NewValue })
            .Take(10000)
            .ToListAsync(ct);

        var prevHash = "genesis";
        var broken = 0;
        foreach (var e in events)
        {
            var content = $"{prevHash}|{e.Action}|{e.ResourceId}|{e.NewValue}";
            var expected = Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(
                    System.Text.Encoding.UTF8.GetBytes(content)));
            if (!string.Equals(e.Hash, expected, StringComparison.OrdinalIgnoreCase)) broken++;
            prevHash = e.Hash ?? prevHash;
        }

        return Ok(new { checked = events.Count, tampered = broken, isIntact = broken == 0 });
    }
}
