using HRMSPlatform.Modules.TenantManagement.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.TenantManagement.Infrastructure;

public class TenantDbContext(DbContextOptions<TenantDbContext> options) : DbContext(options)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantFeatureFlag> FeatureFlags => Set<TenantFeatureFlag>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Tenant>(b =>
        {
            b.ToTable("tenants");
            b.HasKey(x => x.Id);
            b.Property(x => x.Slug).HasMaxLength(100).IsRequired();
            b.HasIndex(x => x.Slug).IsUnique();
            b.Property(x => x.DisplayName).HasMaxLength(255).IsRequired();
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.Region).HasMaxLength(50);
            b.Property(x => x.DbSchemaName).HasMaxLength(100);
            b.Property(x => x.PlanId).IsRequired();
            b.OwnsOne(x => x.Settings, s =>
            {
                s.ToJson();
            });
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<TenantFeatureFlag>(b =>
        {
            b.ToTable("tenant_feature_flags");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.FlagKey).HasMaxLength(100);
            b.HasIndex(x => new { x.TenantId, x.FlagKey }).IsUnique();
        });
    }
}
