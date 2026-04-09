using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.EmployeeManagement.Domain.Events;

// ─── Domain Events (internal) ───────────────────────────────────────────────

public record EmployeeCreatedEvent(
    Guid EmployeeId,
    Guid TenantId,
    string FullName,
    DateOnly HireDate,
    Guid? DepartmentId,
    Guid? PositionId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record EmployeeTransferredEvent(
    Guid EmployeeId,
    Guid TenantId,
    Guid? FromDeptId,
    Guid? ToDeptId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record EmployeeTerminatedEvent(
    Guid EmployeeId,
    Guid TenantId,
    DateOnly ExitDate,
    string Reason) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

// ─── Integration Events (published to Kafka) ────────────────────────────────

public record EmployeeCreatedIntegrationEvent(
    Guid TenantId,
    Guid EmployeeId,
    Guid? UserId,
    string FullName,
    string EmployeeNumber,
    DateOnly HireDate,
    Guid? DepartmentId,
    Guid? PositionId) : IntegrationEvent(TenantId);

public record EmployeeTerminatedIntegrationEvent(
    Guid TenantId,
    Guid EmployeeId,
    Guid? UserId,
    DateOnly ExitDate,
    string Reason) : IntegrationEvent(TenantId);

public record EmployeeTransferredIntegrationEvent(
    Guid TenantId,
    Guid EmployeeId,
    Guid? FromDepartmentId,
    Guid? ToDepartmentId) : IntegrationEvent(TenantId);
