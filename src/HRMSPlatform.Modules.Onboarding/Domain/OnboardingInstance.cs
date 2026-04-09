using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.Onboarding.Domain;

public enum OnboardingStatus { InProgress, Completed, Cancelled }
public enum TaskStatus { Pending, InProgress, Completed, Skipped, Overdue }
public enum TaskActionType { Manual, Form, Document, ESign, ApiCall }

public sealed class OnboardingTemplate : AggregateRoot<Guid>
{
    private OnboardingTemplate() { }
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public bool IsDefault { get; private set; }
    public string? AppliesTo { get; private set; }  // JSON filter criteria
    public DateTime CreatedAt { get; private set; }
    private readonly List<TaskTemplate> _tasks = [];
    public IReadOnlyCollection<TaskTemplate> Tasks => _tasks.AsReadOnly();

    public static OnboardingTemplate Create(Guid tenantId, string name, bool isDefault = false) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, Name = name,
            IsDefault = isDefault, CreatedAt = DateTime.UtcNow
        };

    public void AddTask(TaskTemplate task) => _tasks.Add(task);
}

public sealed class TaskTemplate
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TemplateId { get; init; }
    public int Stage { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string AssigneeRole { get; init; } = "HR";  // HR, IT, MANAGER, EMPLOYEE
    public int DueDaysOffset { get; init; }
    public bool IsMandatory { get; init; } = true;
    public TaskActionType ActionType { get; init; }
    public string? ActionConfig { get; init; }         // JSON
}

public sealed class OnboardingInstance : AggregateRoot<Guid>
{
    private OnboardingInstance() { }
    public Guid TenantId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public Guid TemplateId { get; private set; }
    public OnboardingStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    private readonly List<OnboardingTask> _tasks = [];
    public IReadOnlyCollection<OnboardingTask> Tasks => _tasks.AsReadOnly();

    public static OnboardingInstance Create(Guid tenantId, Guid employeeId, Guid templateId,
        IEnumerable<TaskTemplate> taskTemplates, DateOnly hireDate) =>
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EmployeeId = employeeId,
            TemplateId = templateId,
            Status = OnboardingStatus.InProgress,
            StartedAt = DateTime.UtcNow,
            _tasks = taskTemplates.Select(tt => OnboardingTask.From(tt, hireDate)).ToList()
        };

    public void CompleteTask(Guid taskId, string? notes, string? completionData)
    {
        var task = _tasks.First(t => t.Id == taskId);
        task.Complete(notes, completionData);

        if (_tasks.Where(t => t.IsMandatory).All(t => t.Status == TaskStatus.Completed))
        {
            Status = OnboardingStatus.Completed;
            CompletedAt = DateTime.UtcNow;
            AddDomainEvent(new Events.OnboardingCompletedEvent(Id, TenantId, EmployeeId));
        }
    }

    public int CompletionPercentage =>
        _tasks.Count == 0 ? 0 :
        (int)(_tasks.Count(t => t.Status == TaskStatus.Completed) * 100.0 / _tasks.Count);
}

public sealed class OnboardingTask
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid InstanceId { get; init; }
    public int Stage { get; init; }
    public string Title { get; init; } = string.Empty;
    public string AssigneeRole { get; init; } = string.Empty;
    public DateOnly DueDate { get; init; }
    public bool IsMandatory { get; init; }
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public string? Notes { get; set; }
    public string? CompletionData { get; set; }  // JSON form responses
    public DateTime? CompletedAt { get; set; }

    public static OnboardingTask From(TaskTemplate t, DateOnly hireDate) =>
        new()
        {
            InstanceId = Guid.Empty,  // set during save
            Stage = t.Stage, Title = t.Title,
            AssigneeRole = t.AssigneeRole, IsMandatory = t.IsMandatory,
            DueDate = hireDate.AddDays(t.DueDaysOffset)
        };

    public void Complete(string? notes, string? data)
    {
        Status = TaskStatus.Completed;
        Notes = notes;
        CompletionData = data;
        CompletedAt = DateTime.UtcNow;
    }
}
