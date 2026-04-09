using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.Billing.Domain.Events;

public record SubscriptionActivatedEvent(Guid SubscriptionId, Guid TenantId, Guid PlanId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record SubscriptionCancelledEvent(Guid SubscriptionId, Guid TenantId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record SubscriptionActivatedIntegrationEvent(
    Guid TenantId, Guid SubscriptionId, Guid PlanId, string PlanName) : IntegrationEvent(TenantId);

public record SubscriptionCancelledIntegrationEvent(
    Guid TenantId, Guid SubscriptionId) : IntegrationEvent(TenantId);

public record PaymentFailedIntegrationEvent(
    Guid TenantId, Guid InvoiceId, decimal Amount, string Reason) : IntegrationEvent(TenantId);
