using HRMSPlatform.Modules.Onboarding.Domain;
using HRMSPlatform.Modules.Onboarding.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Modules.Onboarding.Application.Commands;

// ─── Start Onboarding ─────────────────────────────────────────────────────────

public record StartOnboardingCommand(
    Guid EmployeeId,
    DateOnly HireDate,
    Guid? TemplateId = null) : IRequest<Result<Guid>>;

public sealed class StartOnboardingHandler(
    IOnboardingRepository repo,
    IUnitOfWorkOnboarding uow,
    ITenantContext tenant,
    ILogger<StartOnboardingHandler> logger)
    : IRequestHandler<StartOnboardingCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(StartOnboardingCommand cmd, CancellationToken ct)
    {
        // Pick template: explicit, or default for tenant
        OnboardingTemplate? template;
        if (cmd.TemplateId.HasValue)
            template = await repo.GetTemplateAsync(cmd.TemplateId.Value, ct);
        else
            template = await repo.GetDefaultTemplateAsync(tenant.TenantId, ct);

        if (template is null)
            return Result.Failure<Guid>(Error.Custom("TEMPLATE_NOT_FOUND",
                "No onboarding template found. Create a template first."));

        // Idempotency: one active instance per employee
        var existing = await repo.GetActiveInstanceAsync(cmd.EmployeeId, ct);
        if (existing is not null)
            return Result.Failure<Guid>(Error.Custom("ALREADY_ONBOARDING",
                "An onboarding instance is already in progress for this employee."));

        var instance = OnboardingInstance.Create(
            tenant.TenantId, cmd.EmployeeId, template.Id, template.Tasks, cmd.HireDate);

        await repo.AddInstanceAsync(instance, ct);
        await uow.SaveChangesAsync(ct);

        logger.LogInformation("Onboarding started for employee {EmployeeId} using template {TemplateId}",
            cmd.EmployeeId, template.Id);

        return instance.Id;
    }
}

// ─── Complete Task ─────────────────────────────────────────────────────────────

public record CompleteOnboardingTaskCommand(
    Guid InstanceId,
    Guid TaskId,
    string? Notes,
    string? CompletionData) : IRequest<Result<OnboardingProgressDto>>;

public record OnboardingProgressDto(
    Guid InstanceId,
    OnboardingStatus Status,
    int CompletionPercentage,
    int CompletedTasks,
    int TotalTasks);

public sealed class CompleteOnboardingTaskHandler(
    IOnboardingRepository repo,
    IUnitOfWorkOnboarding uow,
    ITenantContext tenant)
    : IRequestHandler<CompleteOnboardingTaskCommand, Result<OnboardingProgressDto>>
{
    public async Task<Result<OnboardingProgressDto>> Handle(
        CompleteOnboardingTaskCommand cmd, CancellationToken ct)
    {
        var instance = await repo.GetInstanceAsync(cmd.InstanceId, ct);
        if (instance is null || instance.TenantId != tenant.TenantId)
            return Result.Failure<OnboardingProgressDto>(Error.Custom("NOT_FOUND", "Onboarding instance not found."));

        if (instance.Status == OnboardingStatus.Completed)
            return Result.Failure<OnboardingProgressDto>(
                Error.Custom("ALREADY_COMPLETED", "Onboarding is already completed."));

        instance.CompleteTask(cmd.TaskId, cmd.Notes, cmd.CompletionData);
        await uow.SaveChangesAsync(ct);

        return new OnboardingProgressDto(
            instance.Id,
            instance.Status,
            instance.CompletionPercentage,
            instance.Tasks.Count(t => t.Status == Domain.TaskStatus.Completed),
            instance.Tasks.Count);
    }
}

// ─── Create Template ──────────────────────────────────────────────────────────

public record CreateOnboardingTemplateCommand(
    string Name,
    bool IsDefault,
    List<TaskTemplateItem> Tasks) : IRequest<Result<Guid>>;

public record TaskTemplateItem(
    int Stage,
    string Title,
    string? Description,
    string AssigneeRole,
    int DueDaysOffset,
    bool IsMandatory,
    TaskActionType ActionType,
    string? ActionConfig);

public sealed class CreateOnboardingTemplateHandler(
    IOnboardingRepository repo,
    IUnitOfWorkOnboarding uow,
    ITenantContext tenant)
    : IRequestHandler<CreateOnboardingTemplateCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateOnboardingTemplateCommand cmd, CancellationToken ct)
    {
        var template = OnboardingTemplate.Create(tenant.TenantId, cmd.Name, cmd.IsDefault);

        foreach (var t in cmd.Tasks)
        {
            template.AddTask(new TaskTemplate
            {
                Id = Guid.NewGuid(),
                TemplateId = template.Id,
                Stage = t.Stage,
                Title = t.Title,
                Description = t.Description,
                AssigneeRole = t.AssigneeRole,
                DueDaysOffset = t.DueDaysOffset,
                IsMandatory = t.IsMandatory,
                ActionType = t.ActionType,
                ActionConfig = t.ActionConfig
            });
        }

        await repo.AddTemplateAsync(template, ct);
        await uow.SaveChangesAsync(ct);
        return template.Id;
    }
}
