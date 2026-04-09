using HRMSPlatform.Modules.Workflow.Domain;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Workflow.Infrastructure;

public class WorkflowDbContext(DbContextOptions<WorkflowDbContext> options) : DbContext(options)
{
    public DbSet<WorkflowDefinition> Definitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowInstance> Instances => Set<WorkflowInstance>();
    public DbSet<WorkflowTask> Tasks => Set<WorkflowTask>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<WorkflowDefinition>(b =>
        {
            b.ToTable("workflow_definitions");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.Property(x => x.Trigger).HasMaxLength(100);
            b.Property(x => x.Steps).HasColumnType("jsonb");
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<WorkflowInstance>(b =>
        {
            b.ToTable("workflow_instances");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.EntityType, x.EntityId });
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.Context).HasColumnType("jsonb");
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });

        mb.Entity<WorkflowTask>(b =>
        {
            b.ToTable("workflow_tasks");
            b.HasKey(x => x.Id);
            b.Property(x => x.TenantId).IsRequired();
            b.HasIndex(x => new { x.TenantId, x.AssigneeId, x.Status });
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.AssigneeType).HasMaxLength(20);
            b.Ignore(x => x.DomainEvents);
            b.Ignore(x => x.Version);
        });
    }
}
