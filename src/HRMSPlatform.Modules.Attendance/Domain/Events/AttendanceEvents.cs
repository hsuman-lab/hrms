using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.Attendance.Domain.Events;

public record GeoFenceViolationEvent(
    Guid RecordId, Guid TenantId, Guid EmployeeId,
    double? Lat, double? Lng, string? Reason) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record AttendanceMarkedIntegrationEvent(
    Guid TenantId, Guid EmployeeId, DateOnly Date,
    bool Present, double WorkingMinutes, double OvertimeMinutes) : IntegrationEvent(TenantId);

public record GeoFenceViolationIntegrationEvent(
    Guid TenantId, Guid EmployeeId, double? Lat, double? Lng) : IntegrationEvent(TenantId);
