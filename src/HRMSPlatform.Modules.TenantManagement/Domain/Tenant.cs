using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.Modules.TenantManagement.Domain.Events;

namespace HRMSPlatform.Modules.TenantManagement.Domain;

public enum TenantStatus { Active, Suspended, Trial, Churned }

public sealed class Tenant : AggregateRoot<Guid>
{
    private Tenant() { }

    public string Slug { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public TenantStatus Status { get; private set; }
    public string Region { get; private set; } = "ap-south-1";
    public string DbSchemaName { get; private set; } = string.Empty;
    public Guid PlanId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? TrialEndsAt { get; private set; }
    public TenantSettings Settings { get; private set; } = new();

    public static Tenant Create(string slug, string displayName, string region, Guid planId, bool isTrial = true)
    {
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Slug = slug.ToLowerInvariant(),
            DisplayName = displayName,
            Status = isTrial ? TenantStatus.Trial : TenantStatus.Active,
            Region = region,
            DbSchemaName = $"tenant_{slug.ToLowerInvariant().Replace("-", "_")}",
            PlanId = planId,
            CreatedAt = DateTime.UtcNow,
            TrialEndsAt = isTrial ? DateTime.UtcNow.AddDays(30) : null
        };
        tenant.AddDomainEvent(new TenantCreatedEvent(tenant.Id, tenant.Slug, tenant.Region));
        return tenant;
    }

    public void Activate()
    {
        if (Status == TenantStatus.Active) return;
        Status = TenantStatus.Active;
        TrialEndsAt = null;
        AddDomainEvent(new TenantActivatedEvent(Id));
    }

    public void Suspend(string reason)
    {
        Status = TenantStatus.Suspended;
        AddDomainEvent(new TenantSuspendedEvent(Id, reason));
    }

    public void UpdateSettings(TenantSettings settings)
    {
        Settings = settings;
        IncrementVersion();
    }

    public void ChangePlan(Guid newPlanId) => PlanId = newPlanId;
}

public sealed record TenantSettings(
    string TimeZone = "Asia/Kolkata",
    string Locale = "en-IN",
    int FiscalYearStartMonth = 4,
    string DateFormat = "DD/MM/YYYY",
    string Currency = "INR");
