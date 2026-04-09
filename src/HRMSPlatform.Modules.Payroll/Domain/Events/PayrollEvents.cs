using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.SharedKernel.Events;

namespace HRMSPlatform.Modules.Payroll.Domain.Events;

public record PayrollApprovedEvent(Guid RunId, Guid TenantId, DateOnly Period) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record PayrollDisbursedEvent(Guid RunId, Guid TenantId, DateOnly Period, decimal TotalNet, int Count) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}

public record PayrollProcessedIntegrationEvent(
    Guid TenantId, Guid RunId, DateOnly PeriodStart, DateOnly PeriodEnd,
    decimal TotalGross, decimal TotalNet, int EmployeeCount) : IntegrationEvent(TenantId);

public record PayslipReadyIntegrationEvent(
    Guid TenantId, Guid EmployeeId, Guid RunId, string PayslipUrl) : IntegrationEvent(TenantId);
