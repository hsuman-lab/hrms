using HRMSPlatform.Infrastructure.Persistence.Outbox;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace HRMSPlatform.Infrastructure.Persistence;

public class HrmsDbContext(DbContextOptions<HrmsDbContext> options, ITenantContext tenantContext)
    : DbContext(options)
{
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("public");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HrmsDbContext).Assembly);

        modelBuilder.Entity<OutboxMessage>(b =>
        {
            b.ToTable("outbox_messages");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).HasColumnName("id");
            b.Property(x => x.TenantId).HasColumnName("tenant_id");
            b.Property(x => x.EventType).HasColumnName("event_type").HasMaxLength(200);
            b.Property(x => x.Payload).HasColumnName("payload").HasColumnType("jsonb");
            b.Property(x => x.Topic).HasColumnName("topic").HasMaxLength(200);
            b.Property(x => x.CreatedAt).HasColumnName("created_at");
            b.Property(x => x.ProcessedAt).HasColumnName("processed_at");
            b.Property(x => x.Error).HasColumnName("error").HasMaxLength(2000);
            b.Property(x => x.RetryCount).HasColumnName("retry_count");
            b.HasIndex(x => new { x.ProcessedAt, x.RetryCount })
             .HasFilter("processed_at IS NULL AND retry_count < 5");
        });

        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        SetAuditFields();
        return await base.SaveChangesAsync(ct);
    }

    private void SetAuditFields()
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Properties.Any(p => p.Metadata.Name == "CreatedAt"))
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                if (entry.Properties.Any(p => p.Metadata.Name == "TenantId") &&
                    tenantContext.IsResolved &&
                    entry.Property("TenantId").CurrentValue is Guid g && g == Guid.Empty)
                    entry.Property("TenantId").CurrentValue = tenantContext.TenantId;
            }
            if (entry.State is EntityState.Modified or EntityState.Added)
            {
                if (entry.Properties.Any(p => p.Metadata.Name == "UpdatedAt"))
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }
}
