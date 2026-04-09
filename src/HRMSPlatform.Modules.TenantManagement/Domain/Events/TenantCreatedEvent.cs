using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.TenantManagement.Domain.Events;

public record TenantCreatedEvent(Guid TenantId, string Slug, string Region) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record TenantActivatedEvent(Guid TenantId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record TenantSuspendedEvent(Guid TenantId, string Reason) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
