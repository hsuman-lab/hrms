using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.LeaveManagement.Domain;

public enum AccrualCycle { None, Monthly, Quarterly, Annual, Upfront }
public enum LeaveRequestStatus { Pending, Approved, Rejected, Cancelled, Recalled }

public sealed class LeaveType : AggregateRoot<Guid>
{
    private LeaveType() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public bool IsPaid { get; private set; }
    public AccrualCycle AccrualCycle { get; private set; }
    public decimal AccrualAmount { get; private set; }
    public decimal? MaxBalance { get; private set; }
    public decimal? CarryForwardLimit { get; private set; }
    public bool IsEncashable { get; private set; }
    public int? MinAdvanceDays { get; private set; }
    public bool RequiresDocument { get; private set; }
    public string? AppliesTo { get; private set; }  // JSON: {gender, employment_type}
    public bool IsActive { get; private set; } = true;

    public static LeaveType Create(
        Guid tenantId, string name, string code, bool isPaid,
        AccrualCycle accrualCycle, decimal accrualAmount,
        decimal? maxBalance = null, decimal? carryForwardLimit = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            Code = code.ToUpperInvariant(),
            IsPaid = isPaid,
            AccrualCycle = accrualCycle,
            AccrualAmount = accrualAmount,
            MaxBalance = maxBalance,
            CarryForwardLimit = carryForwardLimit
        };
}

public sealed class LeaveBalance
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public Guid EmployeeId { get; init; }
    public Guid LeaveTypeId { get; init; }
    public int Year { get; init; }
    public decimal OpeningBalance { get; set; }
    public decimal Accrued { get; set; }
    public decimal Used { get; set; }
    public decimal Adjusted { get; set; }
    public decimal ClosingBalance => OpeningBalance + Accrued - Used + Adjusted;
}

public sealed class LeaveRequest : AggregateRoot<Guid>
{
    private LeaveRequest() { }

    public Guid TenantId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public Guid LeaveTypeId { get; private set; }
    public DateOnly FromDate { get; private set; }
    public DateOnly ToDate { get; private set; }
    public decimal DaysCount { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public LeaveRequestStatus Status { get; private set; }
    public Guid? ApproverId { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? WorkflowInstanceId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public static LeaveRequest Create(
        Guid tenantId, Guid employeeId, Guid leaveTypeId,
        DateOnly from, DateOnly to, decimal days, string reason) =>
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EmployeeId = employeeId,
            LeaveTypeId = leaveTypeId,
            FromDate = from,
            ToDate = to,
            DaysCount = days,
            Reason = reason,
            Status = LeaveRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

    public void SetWorkflowInstance(Guid instanceId)
    {
        WorkflowInstanceId = instanceId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approverId)
    {
        Status = LeaveRequestStatus.Approved;
        ApproverId = approverId;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.LeaveApprovedEvent(Id, TenantId, EmployeeId, LeaveTypeId, DaysCount));
    }

    public void Reject(Guid approverId, string reason)
    {
        Status = LeaveRequestStatus.Rejected;
        ApproverId = approverId;
        RejectionReason = reason;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.LeaveRejectedEvent(Id, TenantId, EmployeeId));
    }

    public void Cancel()
    {
        Status = LeaveRequestStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }
}

public sealed class HolidayCalendar
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public bool IsNational { get; init; }
    public string? CountryCode { get; init; }
    public string? LocationId { get; init; }
}
