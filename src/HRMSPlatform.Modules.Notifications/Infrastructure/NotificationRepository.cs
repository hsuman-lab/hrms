using HRMSPlatform.Modules.Notifications.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Notifications.Infrastructure;

public interface INotificationRepository
{
    Task<NotificationTemplate?> GetTemplateAsync(Guid tenantId, string eventType, NotificationChannel channel, CancellationToken ct = default);
    Task<UserNotificationPreference?> GetPreferenceAsync(Guid userId, string eventType, NotificationChannel channel, CancellationToken ct = default);
    Task<List<NotificationMessage>> GetInboxAsync(Guid userId, Guid tenantId, CancellationToken ct = default);
    Task SaveMessageAsync(NotificationMessage message, CancellationToken ct = default);
    Task UpdateMessageAsync(NotificationMessage message, CancellationToken ct = default);
}

public sealed class NotificationRepository(NotificationDbContext db) : INotificationRepository
{
    public Task<NotificationTemplate?> GetTemplateAsync(Guid tenantId, string eventType, NotificationChannel channel, CancellationToken ct = default) =>
        db.Templates
            .Where(t => (t.TenantId == tenantId || t.TenantId == Guid.Empty) &&
                        t.EventType == eventType && t.Channel == channel && t.IsActive)
            .FirstOrDefaultAsync(ct);

    public Task<UserNotificationPreference?> GetPreferenceAsync(Guid userId, string eventType, NotificationChannel channel, CancellationToken ct = default) =>
        db.Preferences
            .Where(p => p.UserId == userId && p.EventType == eventType && p.Channel == channel)
            .FirstOrDefaultAsync(ct);

    public Task<List<NotificationMessage>> GetInboxAsync(Guid userId, Guid tenantId, CancellationToken ct = default) =>
        db.Messages
            .Where(m => m.RecipientId == userId && m.TenantId == tenantId &&
                        m.Channel == NotificationChannel.InApp)
            .OrderByDescending(m => m.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

    public async Task SaveMessageAsync(NotificationMessage message, CancellationToken ct = default) =>
        await db.Messages.AddAsync(message, ct);

    public async Task UpdateMessageAsync(NotificationMessage message, CancellationToken ct = default)
    {
        db.Messages.Update(message);
        await db.SaveChangesAsync(ct);
    }
}
