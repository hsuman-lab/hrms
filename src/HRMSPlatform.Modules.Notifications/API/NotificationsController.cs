using HRMSPlatform.Modules.Notifications.Application.Commands;
using HRMSPlatform.Modules.Notifications.Domain;
using HRMSPlatform.Modules.Notifications.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Notifications.API;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public sealed class NotificationsController(
    IMediator mediator,
    NotificationDbContext db,
    ITenantContext tenant) : ControllerBase
{
    // ─── Inbox ──────────────────────────────────────────────────────────────

    /// <summary>Get in-app notifications for the authenticated user.</summary>
    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var recipientId = GetRecipientId();
        if (recipientId == Guid.Empty) return Unauthorized();

        var q = db.Messages.Where(m =>
            m.TenantId == tenant.TenantId &&
            m.RecipientId == recipientId &&
            m.Channel == NotificationChannel.InApp);

        if (unreadOnly) q = q.Where(m => m.ReadAt == null);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(m => new
            {
                m.Id, m.EventType, m.Subject, m.Body,
                m.Status, m.CreatedAt, m.ReadAt
            })
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, items });
    }

    /// <summary>Mark a notification as read.</summary>
    [HttpPost("{messageId:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid messageId, CancellationToken ct)
    {
        var recipientId = GetRecipientId();
        var message = await db.Messages.FindAsync([messageId], ct);
        if (message is null || message.RecipientId != recipientId) return NotFound();

        message.ReadAt = DateTime.UtcNow;
        message.Status = NotificationStatus.Read;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Mark all in-app notifications as read for current user.</summary>
    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        var recipientId = GetRecipientId();
        var unread = await db.Messages
            .Where(m => m.TenantId == tenant.TenantId &&
                        m.RecipientId == recipientId &&
                        m.Channel == NotificationChannel.InApp &&
                        m.ReadAt == null)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var m in unread)
        {
            m.ReadAt = now;
            m.Status = NotificationStatus.Read;
        }
        await db.SaveChangesAsync(ct);
        return Ok(new { marked = unread.Count });
    }

    // ─── Preferences ────────────────────────────────────────────────────────

    /// <summary>Get notification preferences for the current user.</summary>
    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences(CancellationToken ct)
    {
        var userId = GetRecipientId();
        var prefs = await db.Preferences
            .Where(p => p.UserId == userId && p.TenantId == tenant.TenantId)
            .ToListAsync(ct);
        return Ok(prefs);
    }

    /// <summary>Update a notification preference.</summary>
    [HttpPut("preferences")]
    public async Task<IActionResult> UpsertPreference(
        [FromBody] UpsertPreferenceRequest req, CancellationToken ct)
    {
        var userId = GetRecipientId();
        var pref = await db.Preferences
            .Where(p => p.UserId == userId &&
                        p.TenantId == tenant.TenantId &&
                        p.Channel == req.Channel &&
                        p.EventType == req.EventType)
            .FirstOrDefaultAsync(ct);

        if (pref is null)
        {
            pref = new UserNotificationPreference
            {
                UserId = userId,
                TenantId = tenant.TenantId,
                Channel = req.Channel,
                EventType = req.EventType,
                IsEnabled = req.IsEnabled
            };
            await db.Preferences.AddAsync(pref, ct);
        }
        else
        {
            pref.IsEnabled = req.IsEnabled;
        }

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ─── Templates (HR Admin) ───────────────────────────────────────────────

    /// <summary>List notification templates.</summary>
    [HttpGet("templates")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> ListTemplates(CancellationToken ct)
    {
        var templates = await db.Templates
            .Where(t => t.TenantId == tenant.TenantId && t.IsActive)
            .ToListAsync(ct);
        return Ok(templates);
    }

    /// <summary>Trigger a notification (internal/admin use).</summary>
    [HttpPost("send")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> Send([FromBody] SendNotificationCommand cmd, CancellationToken ct)
    {
        var result = await mediator.Send(cmd, ct);
        return result.IsSuccess ? Ok() : BadRequest(new { error = result.Error.Description });
    }

    private Guid GetRecipientId()
    {
        var claim = User.FindFirst("sub") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim?.Value, out var id) ? id : Guid.Empty;
    }
}

public record UpsertPreferenceRequest(NotificationChannel Channel, string EventType, bool IsEnabled);
