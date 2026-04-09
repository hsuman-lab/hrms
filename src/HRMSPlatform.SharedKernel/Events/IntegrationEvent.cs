namespace HRMSPlatform.SharedKernel.Events;

public abstract record IntegrationEvent(Guid TenantId) : IIntegrationEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public string EventType => GetType().Name;
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
