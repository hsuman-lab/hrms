using System.Text.Json;
using HRMSPlatform.SharedKernel.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Infrastructure.Persistence.Outbox;

public sealed class OutboxProcessor(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxProcessor> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessPendingMessagesAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task ProcessPendingMessagesAsync(CancellationToken ct)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<HrmsDbContext>();
        var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

        var messages = await db.OutboxMessages
            .Where(m => m.ProcessedAt == null && m.RetryCount < 5)
            .OrderBy(m => m.CreatedAt)
            .Take(50)
            .ToListAsync(ct);

        foreach (var message in messages)
        {
            try
            {
                // Deserialize and publish
                var eventType = Type.GetType(message.EventType);
                if (eventType is not null)
                {
                    var @event = JsonSerializer.Deserialize(message.Payload, eventType);
                    if (@event is SharedKernel.Events.IIntegrationEvent integrationEvent)
                    {
                        await eventBus.PublishAsync(integrationEvent, ct);
                    }
                }
                message.MarkProcessed();
                logger.LogDebug("Outbox message {Id} ({EventType}) published", message.Id, message.EventType);
            }
            catch (Exception ex)
            {
                message.MarkFailed(ex.Message);
                logger.LogError(ex, "Failed to process outbox message {Id}", message.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
