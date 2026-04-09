using HRMSPlatform.Modules.Notifications.Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Modules.Notifications.Infrastructure;

public interface INotificationDispatcher
{
    Task SendAsync(NotificationMessage message, CancellationToken ct = default);
}

/// <summary>
/// Routes notifications to channel-specific senders (SES, SNS, FCM, WebSocket).
/// Each channel sender can be swapped independently.
/// </summary>
public sealed class NotificationDispatcher(
    IConfiguration config,
    ILogger<NotificationDispatcher> logger) : INotificationDispatcher
{
    public async Task SendAsync(NotificationMessage message, CancellationToken ct = default)
    {
        switch (message.Channel)
        {
            case NotificationChannel.Email:
                await SendEmailAsync(message, ct);
                break;
            case NotificationChannel.Sms:
                await SendSmsAsync(message, ct);
                break;
            case NotificationChannel.InApp:
                await SendInAppAsync(message, ct);
                break;
            case NotificationChannel.Push:
                await SendPushAsync(message, ct);
                break;
            default:
                logger.LogWarning("Unsupported notification channel: {Channel}", message.Channel);
                break;
        }
    }

    private Task SendEmailAsync(NotificationMessage msg, CancellationToken ct)
    {
        // In production: AWS SES or SendGrid
        // var client = new AmazonSimpleEmailServiceV2Client();
        // await client.SendEmailAsync(new SendEmailRequest { ... });
        logger.LogInformation("EMAIL → {RecipientId} | {Subject}", msg.RecipientId, msg.Subject);
        return Task.CompletedTask;
    }

    private Task SendSmsAsync(NotificationMessage msg, CancellationToken ct)
    {
        // In production: Twilio or AWS SNS
        logger.LogInformation("SMS → {RecipientId} | {Body}", msg.RecipientId, msg.Body[..Math.Min(50, msg.Body.Length)]);
        return Task.CompletedTask;
    }

    private Task SendInAppAsync(NotificationMessage msg, CancellationToken ct)
    {
        // In production: push via SignalR hub or SSE endpoint
        logger.LogInformation("IN_APP → {RecipientId} | {EventType}", msg.RecipientId, msg.EventType);
        return Task.CompletedTask;
    }

    private Task SendPushAsync(NotificationMessage msg, CancellationToken ct)
    {
        // In production: FCM (Firebase) or APNs
        logger.LogInformation("PUSH → {RecipientId} | {Subject}", msg.RecipientId, msg.Subject);
        return Task.CompletedTask;
    }
}
