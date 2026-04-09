using HRMSPlatform.Modules.Workflow.Domain;
using HRMSPlatform.Modules.Workflow.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using System.Text.Json;

namespace HRMSPlatform.Modules.Workflow.Application.Commands;

// ─── Create Workflow Definition ───────────────────────────────────────────────

public record WorkflowStepDto(
    int Order,
    string Name,
    string AssigneeType,        // Role | User | Manager | HrAdmin
    string? AssigneeValue,      // role name or user id
    int? SlaHours,
    bool AllowDelegation,
    bool AllowRejection);

public record CreateWorkflowDefinitionCommand(
    string Name,
    string Trigger,
    List<WorkflowStepDto> Steps) : IRequest<Result<Guid>>;

public sealed class CreateWorkflowDefinitionHandler(
    IWorkflowRepository repo,
    IUnitOfWorkWorkflow uow,
    ITenantContext tenant)
    : IRequestHandler<CreateWorkflowDefinitionCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateWorkflowDefinitionCommand cmd, CancellationToken ct)
    {
        var stepsJson = JsonSerializer.Serialize(cmd.Steps);
        var definition = WorkflowDefinition.Create(tenant.TenantId, cmd.Name, cmd.Trigger, stepsJson);
        await repo.AddDefinitionAsync(definition, ct);
        await uow.SaveChangesAsync(ct);
        return definition.Id;
    }
}

// ─── Start Workflow Instance ──────────────────────────────────────────────────

public record StartWorkflowCommand(
    string Trigger,
    string EntityType,
    Guid EntityId,
    Dictionary<string, string>? Context = null) : IRequest<Result<Guid>>;

public sealed class StartWorkflowHandler(
    IWorkflowRepository repo,
    IUnitOfWorkWorkflow uow,
    ITenantContext tenant)
    : IRequestHandler<StartWorkflowCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(StartWorkflowCommand cmd, CancellationToken ct)
    {
        var definition = await repo.GetActiveDefinitionAsync(tenant.TenantId, cmd.Trigger, ct);
        if (definition is null)
            return Result.Failure<Guid>(Error.Custom("NO_WORKFLOW",
                $"No active workflow defined for trigger '{cmd.Trigger}'."));

        var contextJson = JsonSerializer.Serialize(cmd.Context ?? new Dictionary<string, string>());
        var instance = WorkflowInstance.Create(
            tenant.TenantId, definition.Id, definition.Version,
            cmd.EntityType, cmd.EntityId, contextJson);

        // Create first task from step 1
        var firstTask = await CreateTaskForStep(instance, definition, 1, ct);

        await repo.AddInstanceAsync(instance, ct);
        if (firstTask is not null) await repo.AddTaskAsync(firstTask, ct);
        await uow.SaveChangesAsync(ct);

        return instance.Id;
    }

    private async Task<WorkflowTask?> CreateTaskForStep(
        WorkflowInstance instance, WorkflowDefinition definition,
        int step, CancellationToken ct)
    {
        try
        {
            var steps = JsonSerializer.Deserialize<WorkflowStepDto[]>(definition.Steps) ?? [];
            var stepDef = steps.FirstOrDefault(s => s.Order == step);
            if (stepDef is null) return null;

            var assigneeId = stepDef.AssigneeType == "User" && Guid.TryParse(stepDef.AssigneeValue, out var uid)
                ? uid
                : tenant.TenantId; // fallback: assign to tenant admin queue

            var dueAt = stepDef.SlaHours.HasValue
                ? DateTime.UtcNow.AddHours(stepDef.SlaHours.Value)
                : (DateTime?)null;

            return WorkflowTask.Create(instance.Id, tenant.TenantId, step,
                assigneeId, stepDef.AssigneeType, dueAt);
        }
        catch
        {
            return null;
        }
    }
}

// ─── Approve / Reject Task ────────────────────────────────────────────────────

public record ApproveWorkflowTaskCommand(Guid TaskId, string? Comments) : IRequest<Result>;

public sealed class ApproveWorkflowTaskHandler(
    IWorkflowRepository repo,
    IUnitOfWorkWorkflow uow,
    ITenantContext tenant)
    : IRequestHandler<ApproveWorkflowTaskCommand, Result>
{
    public async Task<Result> Handle(ApproveWorkflowTaskCommand cmd, CancellationToken ct)
    {
        var task = await repo.GetTaskAsync(cmd.TaskId, ct);
        if (task is null || task.TenantId != tenant.TenantId)
            return Result.Failure(Error.Custom("NOT_FOUND", "Workflow task not found."));

        if (task.Status != WorkflowTaskStatus.Pending)
            return Result.Failure(Error.Custom("TASK_NOT_PENDING", "Task is not in pending state."));

        task.Approve(cmd.Comments);

        var instance = await repo.GetInstanceAsync(task.InstanceId, ct);
        if (instance is null) return Result.Failure(Error.Custom("NOT_FOUND", "Workflow instance not found."));

        var definition = await repo.GetDefinitionAsync(instance.DefinitionId, ct);
        if (definition is null) return Result.Failure(Error.Custom("NOT_FOUND", "Workflow definition not found."));

        // Check if more steps remain
        var steps = JsonSerializer.Deserialize<WorkflowStepDto[]>(definition.Steps) ?? [];
        var nextStep = task.Step + 1;
        var nextStepDef = steps.FirstOrDefault(s => s.Order == nextStep);

        if (nextStepDef is null)
        {
            // No more steps — complete the workflow
            instance.Complete();
        }
        else
        {
            // Advance to next step and create task
            instance.AdvanceStep();
            var assigneeId = nextStepDef.AssigneeType == "User" &&
                             Guid.TryParse(nextStepDef.AssigneeValue, out var uid)
                ? uid : tenant.TenantId;

            var dueAt = nextStepDef.SlaHours.HasValue
                ? DateTime.UtcNow.AddHours(nextStepDef.SlaHours.Value)
                : (DateTime?)null;

            var nextTask = WorkflowTask.Create(instance.Id, tenant.TenantId, nextStep,
                assigneeId, nextStepDef.AssigneeType, dueAt);
            await repo.AddTaskAsync(nextTask, ct);
        }

        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public record RejectWorkflowTaskCommand(Guid TaskId, string Comments) : IRequest<Result>;

public sealed class RejectWorkflowTaskHandler(
    IWorkflowRepository repo,
    IUnitOfWorkWorkflow uow,
    ITenantContext tenant)
    : IRequestHandler<RejectWorkflowTaskCommand, Result>
{
    public async Task<Result> Handle(RejectWorkflowTaskCommand cmd, CancellationToken ct)
    {
        var task = await repo.GetTaskAsync(cmd.TaskId, ct);
        if (task is null || task.TenantId != tenant.TenantId)
            return Result.Failure(Error.Custom("NOT_FOUND", "Workflow task not found."));

        task.Reject(cmd.Comments);

        var instance = await repo.GetInstanceAsync(task.InstanceId, ct);
        instance?.Reject();

        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
