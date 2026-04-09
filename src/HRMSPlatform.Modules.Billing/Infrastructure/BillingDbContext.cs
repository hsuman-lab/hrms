using HRMSPlatform.Modules.Billing.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Billing.Infrastructure;

public class BillingDbContext(DbContextOptions<BillingDbContext> options) : DbContext(options)
{
    public DbSet<SubscriptionPlan> Plans => Set<SubscriptionPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<SubscriptionPlan>(b =>
        {
            b.ToTable("subscription_plans");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(100);
            b.Property(x => x.PricePerSeat).HasPrecision(10, 2);
            b.Property(x => x.BillingCycle).HasConversion<string>().HasMaxLength(10);
            b.Property(x => x.Features).HasColumnType("jsonb");
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<Subscription>(b =>
        {
            b.ToTable("subscriptions");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => x.TenantId);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<Invoice>(b =>
        {
            b.ToTable("invoices");
            b.HasKey(x => x.Id);
            b.Property(x => x.Amount).HasPrecision(12, 2);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.LineItems).HasColumnType("jsonb");
        });
    }
}
