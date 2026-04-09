namespace HRMSPlatform.Modules.Notifications.Domain;

public enum NotificationChannel { Email, Sms, Push, InApp, WhatsApp }
public enum NotificationStatus { Queued, Sent, Delivered, Failed, Read }

public sealed class NotificationTemplate
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public string EventType { get; init; } = string.Empty;
    public NotificationChannel Channel { get; init; }
    public string Subject { get; init; } = string.Empty;
    public string BodyTemplate { get; init; } = string.Empty; // Handlebars
    public string Locale { get; init; } = "en";
    public bool IsActive { get; init; } = true;
}

public sealed class NotificationMessage
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public Guid RecipientId { get; init; }
    public NotificationChannel Channel { get; init; }
    public string EventType { get; init; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public NotificationStatus Status { get; set; } = NotificationStatus.Queued;
    public int RetryCount { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public string? Error { get; set; }
}

public sealed class UserNotificationPreference
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
    public NotificationChannel Channel { get; init; }
    public string EventType { get; init; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}
