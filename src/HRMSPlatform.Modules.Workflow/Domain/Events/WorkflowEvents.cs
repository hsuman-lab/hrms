using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.Workflow.Domain.Events;

public record WorkflowStepAdvancedEvent(Guid InstanceId, Guid TenantId, int NewStep) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record WorkflowCompletedEvent(
    Guid InstanceId, Guid TenantId, string EntityType, Guid EntityId, bool Approved) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record WorkflowApprovalDecisionIntegrationEvent(
    Guid TenantId, Guid InstanceId, string EntityType, Guid EntityId,
    bool Approved, string? Comments) : IntegrationEvent(TenantId);

public record WorkflowEscalatedIntegrationEvent(
    Guid TenantId, Guid InstanceId, Guid TaskId, int Step) : IntegrationEvent(TenantId);
