using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.Billing.Domain;

public enum SubscriptionStatus { Trialing, Active, PastDue, Cancelled, Unpaid }
public enum BillingCycle { Monthly, Annual }
public enum InvoiceStatus { Draft, Open, Paid, Void, Uncollectible }

public sealed class SubscriptionPlan : AggregateRoot<Guid>
{
    private SubscriptionPlan() { }

    public string Name { get; private set; } = string.Empty;
    public decimal PricePerSeat { get; private set; }
    public BillingCycle BillingCycle { get; private set; }
    public int? MaxEmployees { get; private set; }
    public string Features { get; private set; } = "{}"; // JSON feature matrix
    public bool IsActive { get; private set; } = true;

    public static SubscriptionPlan Create(string name, decimal pricePerSeat, BillingCycle cycle,
        int? maxEmployees = null, string? features = null) =>
        new()
        {
            Id = Guid.NewGuid(), Name = name, PricePerSeat = pricePerSeat,
            BillingCycle = cycle, MaxEmployees = maxEmployees, Features = features ?? "{}"
        };
}

public sealed class Subscription : AggregateRoot<Guid>
{
    private Subscription() { }

    public Guid TenantId { get; private set; }
    public Guid PlanId { get; private set; }
    public SubscriptionStatus Status { get; private set; }
    public DateTime? TrialEndsAt { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }
    public string? ExternalPaymentId { get; private set; }   // Stripe subscription ID
    public int SeatCount { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public static Subscription CreateTrial(Guid tenantId, Guid planId, int seats) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, PlanId = planId,
            Status = SubscriptionStatus.Trialing, SeatCount = seats,
            TrialEndsAt = DateTime.UtcNow.AddDays(30),
            PeriodStart = DateTime.UtcNow,
            PeriodEnd = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow
        };

    public void Activate(string externalPaymentId, DateTime periodEnd)
    {
        Status = SubscriptionStatus.Active;
        ExternalPaymentId = externalPaymentId;
        PeriodEnd = periodEnd;
        AddDomainEvent(new Events.SubscriptionActivatedEvent(Id, TenantId, PlanId));
    }

    public void Cancel()
    {
        Status = SubscriptionStatus.Cancelled;
        AddDomainEvent(new Events.SubscriptionCancelledEvent(Id, TenantId));
    }

    public void MarkPastDue() => Status = SubscriptionStatus.PastDue;
    public void UpdateSeats(int seats) => SeatCount = seats;
}

public sealed class Invoice
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public Guid SubscriptionId { get; init; }
    public decimal Amount { get; init; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    public DateOnly DueDate { get; init; }
    public DateTime? PaidAt { get; set; }
    public string? LineItems { get; init; }  // JSON
    public string? ExternalInvoiceId { get; init; } // Stripe invoice ID
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
