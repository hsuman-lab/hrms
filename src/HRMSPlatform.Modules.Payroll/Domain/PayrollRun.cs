using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.Payroll.Domain;

public enum PayrollRunStatus { Draft, Processing, Review, Approved, Disbursed, Failed }
public enum PayrollRunType { Regular, OffCycle, Bonus, FinalAndFull }

public sealed class PayrollRun : AggregateRoot<Guid>
{
    private PayrollRun() { }

    public Guid TenantId { get; private set; }
    public DateOnly PeriodStart { get; private set; }
    public DateOnly PeriodEnd { get; private set; }
    public PayrollRunStatus Status { get; private set; }
    public PayrollRunType RunType { get; private set; }
    public Guid? InitiatedBy { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public DateTime? DisbursedAt { get; private set; }
    public decimal TotalGross { get; private set; }
    public decimal TotalNet { get; private set; }
    public int EmployeeCount { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public static PayrollRun Create(
        Guid tenantId, DateOnly periodStart, DateOnly periodEnd,
        PayrollRunType runType, Guid initiatedBy) =>
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            Status = PayrollRunStatus.Draft,
            RunType = runType,
            InitiatedBy = initiatedBy,
            CreatedAt = DateTime.UtcNow
        };

    public void MarkProcessing() { Status = PayrollRunStatus.Processing; ProcessedAt = DateTime.UtcNow; }
    public void MarkReview(decimal totalGross, decimal totalNet, int count)
    {
        Status = PayrollRunStatus.Review;
        TotalGross = totalGross;
        TotalNet = totalNet;
        EmployeeCount = count;
    }
    public void Approve(Guid approverId)
    {
        Status = PayrollRunStatus.Approved;
        ApprovedBy = approverId;
        ApprovedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.PayrollApprovedEvent(Id, TenantId, PeriodStart));
    }
    public void MarkDisbursed()
    {
        Status = PayrollRunStatus.Disbursed;
        DisbursedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.PayrollDisbursedEvent(Id, TenantId, PeriodStart, TotalNet, EmployeeCount));
    }
    public void MarkFailed() => Status = PayrollRunStatus.Failed;
}

public sealed class PayrollEntry
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid RunId { get; init; }
    public Guid TenantId { get; init; }
    public Guid EmployeeId { get; init; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public decimal LopDays { get; set; }
    public decimal LopAmount { get; set; }
    public decimal Reimbursements { get; set; }
    public string? Earnings { get; set; }       // JSON computed breakdown
    public string? Deductions { get; set; }     // JSON computed breakdown
    public string? ComputationLog { get; set; } // JSON step-by-step trace for audit
    public string PaymentStatus { get; set; } = "Pending";
    public string? PayslipUrl { get; set; }
    public string? BankAccount { get; set; }    // encrypted
    public DateTime ComputedAt { get; init; } = DateTime.UtcNow;
}
