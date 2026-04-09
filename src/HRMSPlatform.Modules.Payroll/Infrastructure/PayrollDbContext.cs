using HRMSPlatform.Modules.Payroll.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Payroll.Infrastructure;

public class PayrollDbContext(DbContextOptions<PayrollDbContext> options) : DbContext(options)
{
    public DbSet<PayrollRun> PayrollRuns => Set<PayrollRun>();
    public DbSet<PayrollEntry> PayrollEntries => Set<PayrollEntry>();
    public DbSet<SalaryStructure> SalaryStructures => Set<SalaryStructure>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<PayrollRun>(b =>
        {
            b.ToTable("payroll_runs");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.PeriodStart, x.RunType });
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.RunType).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.TotalGross).HasPrecision(18, 2);
            b.Property(x => x.TotalNet).HasPrecision(18, 2);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<PayrollEntry>(b =>
        {
            b.ToTable("payroll_entries");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.RunId, x.EmployeeId }).IsUnique(); // idempotency
            b.Property(x => x.GrossSalary).HasPrecision(15, 2);
            b.Property(x => x.NetSalary).HasPrecision(15, 2);
            b.Property(x => x.LopAmount).HasPrecision(12, 2);
            b.Property(x => x.Earnings).HasColumnType("jsonb");
            b.Property(x => x.Deductions).HasColumnType("jsonb");
            b.Property(x => x.ComputationLog).HasColumnType("jsonb");
            b.Property(x => x.BankAccount).HasMaxLength(1000); // encrypted
        });

        mb.Entity<SalaryStructure>(b =>
        {
            b.ToTable("salary_structures");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200);
            b.Property(x => x.CountryCode).HasMaxLength(5);
            b.Property(x => x.Components).HasColumnType("jsonb");
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });
    }
}
