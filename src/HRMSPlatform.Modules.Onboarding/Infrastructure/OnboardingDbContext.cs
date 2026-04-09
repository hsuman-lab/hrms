using HRMSPlatform.Modules.Onboarding.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Onboarding.Infrastructure;

public class OnboardingDbContext(DbContextOptions<OnboardingDbContext> options) : DbContext(options)
{
    public DbSet<OnboardingTemplate> Templates => Set<OnboardingTemplate>();
    public DbSet<OnboardingInstance> Instances => Set<OnboardingInstance>();
    public DbSet<TaskTemplate> TaskTemplates => Set<TaskTemplate>();
    public DbSet<OnboardingTask> Tasks => Set<OnboardingTask>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<OnboardingTemplate>(b =>
        {
            b.ToTable("onboarding_templates");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.AppliesTo).HasColumnType("jsonb");
            b.HasMany(x => x.Tasks).WithOne().HasForeignKey(t => t.TemplateId);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<TaskTemplate>(b =>
        {
            b.ToTable("onboarding_task_templates");
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(300);
            b.Property(x => x.ActionType).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.ActionConfig).HasColumnType("jsonb");
        });

        mb.Entity<OnboardingInstance>(b =>
        {
            b.ToTable("onboarding_instances");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.EmployeeId });
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.HasMany(x => x.Tasks).WithOne().HasForeignKey(t => t.InstanceId);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
            b.Ignore(x => x.CompletionPercentage);
        });

        mb.Entity<OnboardingTask>(b =>
        {
            b.ToTable("onboarding_tasks");
            b.HasKey(x => x.Id);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.CompletionData).HasColumnType("jsonb");
        });
    }
}
