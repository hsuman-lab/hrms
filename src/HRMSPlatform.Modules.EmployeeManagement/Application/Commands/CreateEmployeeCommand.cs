using HRMSPlatform.Modules.EmployeeManagement.Domain;
using HRMSPlatform.Modules.EmployeeManagement.Domain.Events;
using HRMSPlatform.Modules.EmployeeManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;

namespace HRMSPlatform.Modules.EmployeeManagement.Application.Commands;

public record CreateEmployeeCommand(
    string FirstName,
    string LastName,
    string PersonalEmail,
    string Phone,
    DateOnly HireDate,
    EmploymentType EmploymentType,
    Guid? DepartmentId,
    Guid? PositionId,
    Guid? ReportsToId,
    string? CustomFields = null) : IRequest<Result<EmployeeDto>>;

public record EmployeeDto(
    Guid Id,
    string EmployeeNumber,
    string FullName,
    string Status,
    string EmploymentType,
    DateOnly HireDate,
    Guid? DepartmentId,
    Guid? PositionId,
    DateTime CreatedAt);

public sealed class CreateEmployeeHandler(
    IEmployeeRepository repo,
    IUnitOfWorkEmployee uow,
    ITenantContext tenant,
    IEventBus eventBus) : IRequestHandler<CreateEmployeeCommand, Result<EmployeeDto>>
{
    public async Task<Result<EmployeeDto>> Handle(CreateEmployeeCommand cmd, CancellationToken ct)
    {
        var number = await repo.GenerateNextEmployeeNumberAsync(tenant.TenantId, ct);

        var employee = Employee.Create(
            tenant.TenantId,
            number,
            cmd.FirstName,
            cmd.LastName,
            cmd.PersonalEmail,
            cmd.HireDate,
            cmd.EmploymentType,
            cmd.DepartmentId,
            cmd.PositionId,
            cmd.ReportsToId);

        if (cmd.CustomFields is not null)
            employee.UpdateCustomFields(cmd.CustomFields);

        await repo.AddAsync(employee, ct);
        await uow.SaveChangesAsync(ct);

        // Publish integration event for cross-module fanout
        await eventBus.PublishAsync(new EmployeeCreatedIntegrationEvent(
            tenant.TenantId, employee.Id, null, employee.FullName,
            employee.EmployeeNumber, employee.HireDate,
            employee.DepartmentId, employee.PositionId), ct);

        return ToDto(employee);
    }

    private static EmployeeDto ToDto(Employee e) =>
        new(e.Id, e.EmployeeNumber, e.FullName, e.Status.ToString(),
            e.EmploymentType.ToString(), e.HireDate, e.DepartmentId, e.PositionId, e.CreatedAt);
}
