using HRMSPlatform.Modules.Attendance.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Attendance.Infrastructure;

public class AttendanceDbContext(DbContextOptions<AttendanceDbContext> options) : DbContext(options)
{
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<OfficeLocation> OfficeLocations => Set<OfficeLocation>();
    public DbSet<Shift> Shifts => Set<Shift>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<AttendanceRecord>(b =>
        {
            b.ToTable("attendance_records");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.EmployeeId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.EmployeeId, x.Date }).IsUnique();
            b.Property(x => x.Source).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Ignore(x => x.WorkingMinutes);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<OfficeLocation>(b =>
        {
            b.ToTable("office_locations");
            b.HasKey(x => x.Id);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<Shift>(b =>
        {
            b.ToTable("shifts");
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(100);
            b.Ignore(x => x.ShiftDurationMinutes);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });
    }
}
