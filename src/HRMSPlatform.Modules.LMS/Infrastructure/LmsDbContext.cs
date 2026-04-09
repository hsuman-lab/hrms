using HRMSPlatform.Modules.LMS.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.LMS.Infrastructure;

public class LmsDbContext(DbContextOptions<LmsDbContext> options) : DbContext(options)
{
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Certificate> Certificates => Set<Certificate>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Course>(b =>
        {
            b.ToTable("courses");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Title).HasMaxLength(300).IsRequired();
            b.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<Enrollment>(b =>
        {
            b.ToTable("enrollments");
            b.HasKey(x => x.Id);
            b.HasIndex(x => new { x.TenantId, x.EmployeeId, x.CourseId }).IsUnique();
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<Certificate>(b =>
        {
            b.ToTable("certificates");
            b.HasKey(x => x.Id);
            b.HasIndex(x => x.CertNumber).IsUnique();
        });
    }
}
