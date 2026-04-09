using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.LMS.Domain.Events;

public record CourseCompletedEvent(
    Guid EnrollmentId, Guid TenantId, Guid EmployeeId, Guid CourseId) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record CourseCompletedIntegrationEvent(
    Guid TenantId, Guid EmployeeId, Guid CourseId, DateTime CompletedAt) : IntegrationEvent(TenantId);

public record CertificateIssuedIntegrationEvent(
    Guid TenantId, Guid EmployeeId, Guid CourseId, string CertNumber, DateTime ExpiresAt) : IntegrationEvent(TenantId);
