using HRMSPlatform.Modules.EmployeeManagement.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.EmployeeManagement.Infrastructure;

public class EmployeeDbContext(DbContextOptions<EmployeeDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<EmployeeCompensation> Compensations => Set<EmployeeCompensation>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Employee>(b =>
        {
            b.ToTable("employees");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.EmployeeNumber).HasMaxLength(50).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.EmployeeNumber }).IsUnique();
            b.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            b.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
            b.Property(x => x.EmploymentType).HasConversion<string>().HasMaxLength(30);
            b.Property(x => x.Gender).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.PersonalEmail).HasMaxLength(500); // encrypted
            b.Property(x => x.Phone).HasMaxLength(500);         // encrypted
            b.Property(x => x.NationalId).HasMaxLength(1000);   // encrypted
            b.Property(x => x.CustomFields).HasColumnType("jsonb");
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
            b.Ignore(x => x.FullName);
        });

        mb.Entity<Department>(b =>
        {
            b.ToTable("departments");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<Position>(b =>
        {
            b.ToTable("positions");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Title).HasMaxLength(200).IsRequired();
            b.Property(x => x.Band).HasMaxLength(50);
            b.Property(x => x.Grade).HasMaxLength(50);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<EmployeeCompensation>(b =>
        {
            b.ToTable("employee_compensations");
            b.HasKey(x => x.Id);
            b.Property(x => x.EmployeeId).IsRequired();
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Currency).HasMaxLength(3);
            b.Property(x => x.BaseSalary).HasPrecision(18, 2);
            b.Property(x => x.Components).HasColumnType("jsonb");
            b.Property(x => x.PayFrequency).HasMaxLength(20);
            b.HasIndex(x => new { x.EmployeeId, x.IsCurrent })
             .HasFilter("is_current = true");
        });
    }
}
