using HRMSPlatform.Modules.EmployeeManagement.Domain.Events;
using HRMSPlatform.Modules.EmployeeManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using MediatR;

namespace HRMSPlatform.Modules.EmployeeManagement.Application.Commands;

public record TerminateEmployeeCommand(
    Guid EmployeeId,
    DateOnly ExitDate,
    string Reason) : IRequest<Result>;

public sealed class TerminateEmployeeHandler(
    IEmployeeRepository repo,
    IUnitOfWorkEmployee uow,
    IEventBus eventBus) : IRequestHandler<TerminateEmployeeCommand, Result>
{
    public async Task<Result> Handle(TerminateEmployeeCommand cmd, CancellationToken ct)
    {
        var emp = await repo.GetByIdAsync(cmd.EmployeeId, ct);
        if (emp is null) return Result.Failure(Error.NotFound);

        emp.Terminate(cmd.ExitDate, cmd.Reason);
        await uow.SaveChangesAsync(ct);

        await eventBus.PublishAsync(new EmployeeTerminatedIntegrationEvent(
            emp.TenantId, emp.Id, emp.UserId, cmd.ExitDate, cmd.Reason), ct);

        return Result.Success();
    }
}

public record TransferEmployeeCommand(
    Guid EmployeeId,
    Guid? NewDepartmentId,
    Guid? NewPositionId,
    Guid? NewReportsToId,
    Guid? NewLocationId) : IRequest<Result>;

public sealed class TransferEmployeeHandler(
    IEmployeeRepository repo,
    IUnitOfWorkEmployee uow,
    IEventBus eventBus) : IRequestHandler<TransferEmployeeCommand, Result>
{
    public async Task<Result> Handle(TransferEmployeeCommand cmd, CancellationToken ct)
    {
        var emp = await repo.GetByIdAsync(cmd.EmployeeId, ct);
        if (emp is null) return Result.Failure(Error.NotFound);

        emp.Transfer(cmd.NewDepartmentId, cmd.NewPositionId, cmd.NewReportsToId, cmd.NewLocationId);
        await uow.SaveChangesAsync(ct);

        await eventBus.PublishAsync(new EmployeeTransferredIntegrationEvent(
            emp.TenantId, emp.Id, null, cmd.NewDepartmentId), ct);

        return Result.Success();
    }
}
