namespace HRMSPlatform.SharedKernel.Events;

public interface IIntegrationEvent
{
    Guid EventId { get; }
    string EventType { get; }
    Guid TenantId { get; }
    DateTime OccurredOn { get; }
}
