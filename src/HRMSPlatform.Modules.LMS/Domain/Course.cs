using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.LMS.Domain;

public enum CourseType { Video, Scorm, Document, Quiz, Blended }
public enum EnrollmentStatus { NotStarted, InProgress, Completed, Failed, Expired }

public sealed class Course : AggregateRoot<Guid>
{
    private Course() { }

    public Guid TenantId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public CourseType Type { get; private set; }
    public int DurationMins { get; private set; }
    public bool IsMandatory { get; private set; }
    public string? S3ContentKey { get; private set; }
    public int? PassingScore { get; private set; }
    public int? ValidForDays { get; private set; }
    public string? Category { get; private set; }
    public bool IsPublished { get; private set; }
    public int Version { get; private set; } = 1;
    public DateTime CreatedAt { get; private set; }

    public static Course Create(Guid tenantId, string title, CourseType type,
        bool isMandatory, string? s3Key = null) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, Title = title,
            Type = type, IsMandatory = isMandatory, S3ContentKey = s3Key,
            CreatedAt = DateTime.UtcNow
        };

    public void Publish() { IsPublished = true; Version++; }
    public void Unpublish() => IsPublished = false;
}

public sealed class Enrollment : AggregateRoot<Guid>
{
    private Enrollment() { }

    public Guid TenantId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public Guid CourseId { get; private set; }
    public Guid? AssignedBy { get; private set; }
    public EnrollmentStatus Status { get; private set; }
    public int ProgressPct { get; private set; }
    public int? Score { get; private set; }
    public DateTime EnrolledAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateOnly? DueDate { get; private set; }

    public static Enrollment Create(Guid tenantId, Guid employeeId, Guid courseId,
        Guid? assignedBy = null, DateOnly? dueDate = null) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, EmployeeId = employeeId,
            CourseId = courseId, AssignedBy = assignedBy, Status = EnrollmentStatus.NotStarted,
            DueDate = dueDate, EnrolledAt = DateTime.UtcNow
        };

    public void UpdateProgress(int pct)
    {
        ProgressPct = Math.Min(100, pct);
        if (Status == EnrollmentStatus.NotStarted && pct > 0) Status = EnrollmentStatus.InProgress;
    }

    public void Complete(int? score = null)
    {
        Status = EnrollmentStatus.Completed;
        ProgressPct = 100;
        Score = score;
        CompletedAt = DateTime.UtcNow;
        AddDomainEvent(new Events.CourseCompletedEvent(Id, TenantId, EmployeeId, CourseId));
    }
}

public sealed class Certificate
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid EmployeeId { get; init; }
    public Guid CourseId { get; init; }
    public Guid TenantId { get; init; }
    public DateTime IssuedAt { get; init; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; init; }
    public string CertNumber { get; init; } = string.Empty;
    public string? CertUrl { get; init; }
}
