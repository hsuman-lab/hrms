using HRMSPlatform.Modules.LeaveManagement.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.LeaveManagement.Infrastructure;

public class LeaveDbContext(DbContextOptions<LeaveDbContext> options) : DbContext(options)
{
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<HolidayCalendar> Holidays => Set<HolidayCalendar>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<LeaveType>(b =>
        {
            b.ToTable("leave_types");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Name).HasMaxLength(100).IsRequired();
            b.Property(x => x.Code).HasMaxLength(20).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
            b.Property(x => x.AccrualCycle).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.AccrualAmount).HasPrecision(6, 2);
            b.Property(x => x.MaxBalance).HasPrecision(6, 2);
            b.Property(x => x.CarryForwardLimit).HasPrecision(6, 2);
            b.Property(x => x.AppliesTo).HasColumnType("jsonb");
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<LeaveBalance>(b =>
        {
            b.ToTable("leave_balances");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.TenantId, x.EmployeeId, x.LeaveTypeId, x.Year }).IsUnique();
            b.Property(x => x.OpeningBalance).HasPrecision(6, 2);
            b.Property(x => x.Accrued).HasPrecision(6, 2);
            b.Property(x => x.Used).HasPrecision(6, 2);
            b.Property(x => x.Adjusted).HasPrecision(6, 2);
            b.Ignore(x => x.ClosingBalance); // computed
        });

        mb.Entity<LeaveRequest>(b =>
        {
            b.ToTable("leave_requests");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.EmployeeId).IsRequired();
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.DaysCount).HasPrecision(4, 1);
            b.Property(x => x.Reason).HasMaxLength(1000);
            b.Property(x => x.RejectionReason).HasMaxLength(500);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<HolidayCalendar>(b =>
        {
            b.ToTable("holiday_calendars");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.TenantId, x.Date });
        });
    }
}
