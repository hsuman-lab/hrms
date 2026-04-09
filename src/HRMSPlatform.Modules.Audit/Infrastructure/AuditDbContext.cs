using System.Security.Cryptography;
using System.Text;
using HRMSPlatform.Modules.Audit.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Audit.Infrastructure;

public class AuditDbContext(DbContextOptions<AuditDbContext> options) : DbContext(options)
{
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<AuditEvent>(b =>
        {
            b.ToTable("audit_events");
            b.HasKey(x => x.Id);
            b.Property(x => x.Id).UseIdentityAlwaysColumn();
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Action).HasMaxLength(200).IsRequired();
            b.Property(x => x.ResourceType).HasMaxLength(100);
            b.Property(x => x.ActorType).HasMaxLength(20);
            b.Property(x => x.IpAddress).HasMaxLength(50);
            b.Property(x => x.UserAgent).HasMaxLength(500);
            b.Property(x => x.OldValue).HasColumnType("jsonb");
            b.Property(x => x.NewValue).HasColumnType("jsonb");
            b.Property(x => x.Hash).HasMaxLength(64);
            b.HasIndex(x => new { x.TenantId, x.CreatedAt });
            b.HasIndex(x => new { x.TenantId, x.ResourceType, x.ResourceId });
        });
    }
}

public interface IAuditService
{
    Task LogAsync(
        Guid tenantId,
        Guid? actorId,
        string action,
        string resourceType,
        Guid? resourceId,
        string? oldValue = null,
        string? newValue = null,
        string? ipAddress = null,
        CancellationToken ct = default);
}

public sealed class AuditService(AuditDbContext db) : IAuditService
{
    public async Task LogAsync(
        Guid tenantId, Guid? actorId, string action, string resourceType,
        Guid? resourceId, string? oldValue = null, string? newValue = null,
        string? ipAddress = null, CancellationToken ct = default)
    {
        // Hash chaining for tamper detection
        var lastHash = await db.AuditEvents
            .Where(e => e.TenantId == tenantId)
            .OrderByDescending(e => e.Id)
            .Select(e => e.Hash)
            .FirstOrDefaultAsync(ct) ?? "genesis";

        var content = $"{lastHash}|{action}|{resourceId}|{newValue}";
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(content)));

        var audit = new AuditEvent
        {
            TenantId = tenantId,
            ActorId = actorId,
            Action = action,
            ResourceType = resourceType,
            ResourceId = resourceId,
            OldValue = oldValue,
            NewValue = newValue,
            IpAddress = ipAddress,
            Hash = hash
        };

        await db.AuditEvents.AddAsync(audit, ct);
        await db.SaveChangesAsync(ct);
    }
}
