using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.Workflow.Domain;

public enum WorkflowInstanceStatus { InProgress, Completed, Rejected, Cancelled, Escalated }
public enum WorkflowTaskStatus { Pending, Approved, Rejected, Delegated, Expired }

public sealed class WorkflowDefinition : AggregateRoot<Guid>
{
    private WorkflowDefinition() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Trigger { get; private set; } = string.Empty;  // e.g. "LeaveRequested"
    public string Steps { get; private set; } = "[]";             // JSON step array
    public int Version { get; private set; } = 1;
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; }

    public static WorkflowDefinition Create(Guid tenantId, string name, string trigger, string stepsJson) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, Name = name,
            Trigger = trigger, Steps = stepsJson, CreatedAt = DateTime.UtcNow
        };

    public void UpdateSteps(string stepsJson) { Steps = stepsJson; Version++; }
}

public sealed class WorkflowInstance : AggregateRoot<Guid>
{
    private WorkflowInstance() { }

    public Guid TenantId { get; private set; }
    public Guid DefinitionId { get; private set; }
    public int DefinitionVersion { get; private set; }
    public string EntityType { get; private set; } = string.Empty;  // "LeaveRequest"
    public Guid EntityId { get; private set; }
    public WorkflowInstanceStatus Status { get; private set; }
    public int CurrentStep { get; private set; }
    public string Context { get; private set; } = "{}"; // JSON variables
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public static WorkflowInstance Create(
        Guid tenantId, Guid definitionId, int defVersion,
        string entityType, Guid entityId, string contextJson) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId,
            DefinitionId = definitionId, DefinitionVersion = defVersion,
            EntityType = entityType, EntityId = entityId,
            Status = WorkflowInstanceStatus.InProgress,
            CurrentStep = 1, Context = contextJson,
            CreatedAt = DateTime.UtcNow
        };

    public void AdvanceStep()
    {
        CurrentStep++;
        if (Status == WorkflowInstanceStatus.InProgress)
            AddDomainEvent(new Events.WorkflowStepAdvancedEvent(Id, TenantId, CurrentStep));
    }

    public void Complete()
    {
        Status = WorkflowInstanceStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.WorkflowCompletedEvent(Id, TenantId, EntityType, EntityId, true));
    }

    public void Reject()
    {
        Status = WorkflowInstanceStatus.Rejected;
        CompletedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.WorkflowCompletedEvent(Id, TenantId, EntityType, EntityId, false));
    }

    public void Escalate() => Status = WorkflowInstanceStatus.Escalated;
}

public sealed class WorkflowTask : AggregateRoot<Guid>
{
    private WorkflowTask() { }

    public Guid InstanceId { get; private set; }
    public Guid TenantId { get; private set; }
    public int Step { get; private set; }
    public Guid AssigneeId { get; private set; }
    public string AssigneeType { get; private set; } = string.Empty;
    public WorkflowTaskStatus Status { get; private set; }
    public string? Comments { get; private set; }
    public DateTime? DueAt { get; private set; }
    public DateTime? ActionedAt { get; private set; }

    public static WorkflowTask Create(
        Guid instanceId, Guid tenantId, int step,
        Guid assigneeId, string assigneeType, DateTime? dueAt) =>
        new()
        {
            Id = Guid.NewGuid(), InstanceId = instanceId, TenantId = tenantId,
            Step = step, AssigneeId = assigneeId, AssigneeType = assigneeType,
            Status = WorkflowTaskStatus.Pending, DueAt = dueAt
        };

    public void Approve(string? comments)
    {
        Status = WorkflowTaskStatus.Approved;
        Comments = comments;
        ActionedAt = DateTime.UtcNow;
    }

    public void Reject(string? comments)
    {
        Status = WorkflowTaskStatus.Rejected;
        Comments = comments;
        ActionedAt = DateTime.UtcNow;
    }

    public void Delegate(Guid newAssigneeId)
    {
        AssigneeId = newAssigneeId;
        Status = WorkflowTaskStatus.Delegated;
        ActionedAt = DateTime.UtcNow;
    }
}
