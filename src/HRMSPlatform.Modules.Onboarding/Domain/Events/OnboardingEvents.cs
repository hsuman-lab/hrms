using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.Onboarding.Domain.Events;

public record OnboardingCompletedEvent(Guid InstanceId, Guid TenantId, Guid EmployeeId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record OnboardingCompletedIntegrationEvent(
    Guid TenantId, Guid EmployeeId, Guid InstanceId) : IntegrationEvent(TenantId);
