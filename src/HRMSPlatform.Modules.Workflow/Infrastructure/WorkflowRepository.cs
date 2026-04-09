using HRMSPlatform.Modules.Workflow.Domain;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Workflow.Infrastructure;

public interface IWorkflowRepository
{
    Task<WorkflowDefinition?> GetDefinitionAsync(Guid id, CancellationToken ct = default);
    Task<WorkflowDefinition?> GetActiveDefinitionAsync(Guid tenantId, string trigger, CancellationToken ct = default);
    Task<WorkflowInstance?> GetInstanceAsync(Guid id, CancellationToken ct = default);
    Task<WorkflowTask?> GetTaskAsync(Guid id, CancellationToken ct = default);
    Task<List<WorkflowTask>> GetPendingTasksForAssigneeAsync(Guid assigneeId, CancellationToken ct = default);
    Task AddDefinitionAsync(WorkflowDefinition definition, CancellationToken ct = default);
    Task AddInstanceAsync(WorkflowInstance instance, CancellationToken ct = default);
    Task AddTaskAsync(WorkflowTask task, CancellationToken ct = default);
}

public interface IUnitOfWorkWorkflow
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public sealed class WorkflowRepository(WorkflowDbContext db, ITenantContext tenant)
    : IWorkflowRepository, IUnitOfWorkWorkflow
{
    public Task<WorkflowDefinition?> GetDefinitionAsync(Guid id, CancellationToken ct = default) =>
        db.Definitions.Where(d => d.TenantId == tenant.TenantId && d.Id == id).FirstOrDefaultAsync(ct);

    public Task<WorkflowDefinition?> GetActiveDefinitionAsync(Guid tenantId, string trigger, CancellationToken ct = default) =>
        db.Definitions
            .Where(d => d.TenantId == tenantId && d.Trigger == trigger && d.IsActive)
            .OrderByDescending(d => d.CreatedAt)
            .FirstOrDefaultAsync(ct);

    public Task<WorkflowInstance?> GetInstanceAsync(Guid id, CancellationToken ct = default) =>
        db.Instances.Where(i => i.TenantId == tenant.TenantId && i.Id == id).FirstOrDefaultAsync(ct);

    public Task<WorkflowTask?> GetTaskAsync(Guid id, CancellationToken ct = default) =>
        db.Tasks.Where(t => t.TenantId == tenant.TenantId && t.Id == id).FirstOrDefaultAsync(ct);

    public Task<List<WorkflowTask>> GetPendingTasksForAssigneeAsync(Guid assigneeId, CancellationToken ct = default) =>
        db.Tasks
            .Where(t => t.TenantId == tenant.TenantId &&
                        t.AssigneeId == assigneeId &&
                        t.Status == WorkflowTaskStatus.Pending)
            .OrderBy(t => t.DueAt)
            .ToListAsync(ct);

    public async Task AddDefinitionAsync(WorkflowDefinition definition, CancellationToken ct = default) =>
        await db.Definitions.AddAsync(definition, ct);

    public async Task AddInstanceAsync(WorkflowInstance instance, CancellationToken ct = default) =>
        await db.Instances.AddAsync(instance, ct);

    public async Task AddTaskAsync(WorkflowTask task, CancellationToken ct = default) =>
        await db.Tasks.AddAsync(task, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}
