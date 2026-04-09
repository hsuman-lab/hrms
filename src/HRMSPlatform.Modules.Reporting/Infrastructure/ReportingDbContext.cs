using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Reporting.Infrastructure;

/// <summary>
/// Read-only DbContext pointing at the analytics read replica.
/// Uses raw SQL queries only — no entity tracking.
/// </summary>
public class ReportingDbContext(DbContextOptions<ReportingDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder mb)
    {
        // No entity models — all queries via raw SQL to read replica
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
    }
}
