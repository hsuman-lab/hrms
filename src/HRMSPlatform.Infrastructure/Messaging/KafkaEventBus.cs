using System.Text.Json;
using Confluent.Kafka;
using HRMSPlatform.SharedKernel.Events;
using HRMSPlatform.SharedKernel.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Infrastructure.Messaging;

public sealed class KafkaEventBus : IEventBus, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaEventBus> _logger;

    public KafkaEventBus(IConfiguration config, ILogger<KafkaEventBus> logger)
    {
        _logger = logger;
        var producerConfig = new ProducerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:9092",
            Acks = Acks.All,
            EnableIdempotence = true,
            MessageSendMaxRetries = 5,
            RetryBackoffMs = 1000
        };
        _producer = new ProducerBuilder<string, string>(producerConfig).Build();
    }

    public async Task PublishAsync<T>(T integrationEvent, CancellationToken ct = default)
        where T : IIntegrationEvent
    {
        var topic = BuildTopicName(integrationEvent.EventType);
        var payload = JsonSerializer.Serialize(integrationEvent, integrationEvent.GetType());

        var message = new Message<string, string>
        {
            Key = integrationEvent.TenantId.ToString(),
            Value = payload,
            Headers = new Headers
            {
                { "event-type", System.Text.Encoding.UTF8.GetBytes(integrationEvent.EventType) },
                { "event-id",   System.Text.Encoding.UTF8.GetBytes(integrationEvent.EventId.ToString()) },
                { "tenant-id",  System.Text.Encoding.UTF8.GetBytes(integrationEvent.TenantId.ToString()) }
            }
        };

        var result = await _producer.ProduceAsync(topic, message, ct);
        _logger.LogDebug("Event {EventType} published to {Topic} partition {Partition} offset {Offset}",
            integrationEvent.EventType, topic, result.Partition, result.Offset);
    }

    private static string BuildTopicName(string eventType)
    {
        // EmployeeCreatedEvent → hrms.employee.created
        var name = eventType.Replace("Event", "").Replace("IntegrationEvent", "");
        var parts = SplitCamelCase(name);
        return $"hrms.{string.Join(".", parts).ToLowerInvariant()}";
    }

    private static IEnumerable<string> SplitCamelCase(string input)
    {
        return System.Text.RegularExpressions.Regex.Split(input, @"(?<=[a-z])(?=[A-Z])");
    }

    public void Dispose() => _producer.Dispose();
}
