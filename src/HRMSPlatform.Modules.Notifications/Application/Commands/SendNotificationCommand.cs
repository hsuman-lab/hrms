using System.Text.RegularExpressions;
using HRMSPlatform.Modules.Notifications.Domain;
using HRMSPlatform.Modules.Notifications.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Modules.Notifications.Application.Commands;

public record SendNotificationCommand(
    Guid TenantId,
    Guid RecipientId,
    string EventType,
    Dictionary<string, string> Variables,
    NotificationChannel[]? Channels = null) : IRequest<Result>;

public sealed class SendNotificationHandler(
    INotificationRepository repo,
    INotificationDispatcher dispatcher,
    ILogger<SendNotificationHandler> logger)
    : IRequestHandler<SendNotificationCommand, Result>
{
    public async Task<Result> Handle(SendNotificationCommand cmd, CancellationToken ct)
    {
        var channels = cmd.Channels ?? [NotificationChannel.Email, NotificationChannel.InApp];

        foreach (var channel in channels)
        {
            var template = await repo.GetTemplateAsync(cmd.TenantId, cmd.EventType, channel, ct);
            if (template is null) continue;

            // Check user preferences
            var pref = await repo.GetPreferenceAsync(cmd.RecipientId, cmd.EventType, channel, ct);
            if (pref is not null && !pref.IsEnabled) continue;

            var message = new NotificationMessage
            {
                TenantId = cmd.TenantId,
                RecipientId = cmd.RecipientId,
                Channel = channel,
                EventType = cmd.EventType,
                Subject = RenderTemplate(template.Subject, cmd.Variables),
                Body = RenderTemplate(template.BodyTemplate, cmd.Variables)
            };

            await repo.SaveMessageAsync(message, ct);

            try
            {
                await dispatcher.SendAsync(message, ct);
                message.Status = NotificationStatus.Sent;
                message.SentAt = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                message.Status = NotificationStatus.Failed;
                message.Error = ex.Message;
                message.RetryCount++;
                logger.LogWarning(ex, "Notification send failed for {Channel} {EventType}", channel, cmd.EventType);
            }

            await repo.UpdateMessageAsync(message, ct);
        }

        return Result.Success();
    }

    /// <summary>Simple {{variable}} template renderer.</summary>
    private static string RenderTemplate(string template, Dictionary<string, string> vars)
    {
        foreach (var (key, value) in vars)
            template = template.Replace($"{{{{{key}}}}}", value);
        return template;
    }
}
