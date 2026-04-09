using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.LeaveManagement.Domain.Events;

public record LeaveApprovedEvent(
    Guid LeaveRequestId, Guid TenantId, Guid EmployeeId,
    Guid LeaveTypeId, decimal DaysCount) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record LeaveRejectedEvent(Guid LeaveRequestId, Guid TenantId, Guid EmployeeId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

// Integration events
public record LeaveApprovedIntegrationEvent(
    Guid TenantId, Guid LeaveRequestId, Guid EmployeeId,
    DateOnly FromDate, DateOnly ToDate, decimal DaysCount) : IntegrationEvent(TenantId);

public record LeaveRejectedIntegrationEvent(
    Guid TenantId, Guid LeaveRequestId, Guid EmployeeId,
    string Reason) : IntegrationEvent(TenantId);
