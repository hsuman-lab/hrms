using HRMSPlatform.Modules.LeaveManagement.Domain;
using HRMSPlatform.Modules.LeaveManagement.Domain.Events;
using HRMSPlatform.Modules.LeaveManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;

namespace HRMSPlatform.Modules.LeaveManagement.Application.Commands;

public record ApplyLeaveCommand(
    Guid EmployeeId,
    Guid LeaveTypeId,
    DateOnly FromDate,
    DateOnly ToDate,
    string Reason) : IRequest<Result<Guid>>;

public sealed class ApplyLeaveHandler(
    ILeaveRepository repo,
    ITenantContext tenant,
    IUnitOfWorkLeave uow,
    IEventBus eventBus) : IRequestHandler<ApplyLeaveCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(ApplyLeaveCommand cmd, CancellationToken ct)
    {
        // Verify balance
        var balance = await repo.GetBalanceAsync(cmd.EmployeeId, cmd.LeaveTypeId,
            DateTime.UtcNow.Year, ct);

        var days = CalculateWorkingDays(cmd.FromDate, cmd.ToDate);

        if (balance is null || balance.ClosingBalance < days)
            return Result.Failure<Guid>(Error.Custom("LEAVE_INSUFFICIENT",
                $"Insufficient leave balance. Available: {balance?.ClosingBalance ?? 0}"));

        var request = LeaveRequest.Create(
            tenant.TenantId, cmd.EmployeeId, cmd.LeaveTypeId,
            cmd.FromDate, cmd.ToDate, days, cmd.Reason);

        await repo.AddRequestAsync(request, ct);
        await uow.SaveChangesAsync(ct);

        // Notification + workflow will be triggered by event consumer
        return request.Id;
    }

    private static decimal CalculateWorkingDays(DateOnly from, DateOnly to)
    {
        decimal count = 0;
        for (var d = from; d <= to; d = d.AddDays(1))
            if (d.DayOfWeek is not DayOfWeek.Saturday and not DayOfWeek.Sunday)
                count++;
        return count;
    }
}

public record ApproveLeaveCommand(Guid LeaveRequestId, Guid ApproverId) : IRequest<Result>;

public sealed class ApproveLeaveHandler(
    ILeaveRepository repo,
    IUnitOfWorkLeave uow,
    IEventBus eventBus) : IRequestHandler<ApproveLeaveCommand, Result>
{
    public async Task<Result> Handle(ApproveLeaveCommand cmd, CancellationToken ct)
    {
        var request = await repo.GetRequestByIdAsync(cmd.LeaveRequestId, ct);
        if (request is null) return Result.Failure(Error.NotFound);
        if (request.Status != LeaveRequestStatus.Pending)
            return Result.Failure(Error.Custom("LEAVE_NOT_PENDING", "Leave request is not in pending state."));

        request.Approve(cmd.ApproverId);

        // Deduct balance
        var balance = await repo.GetBalanceAsync(request.EmployeeId, request.LeaveTypeId,
            request.FromDate.Year, ct);
        if (balance is not null)
        {
            balance.Used += request.DaysCount;
        }

        await uow.SaveChangesAsync(ct);

        await eventBus.PublishAsync(new LeaveApprovedIntegrationEvent(
            request.TenantId, request.Id, request.EmployeeId,
            request.FromDate, request.ToDate, request.DaysCount), ct);

        return Result.Success();
    }
}

public record RejectLeaveCommand(Guid LeaveRequestId, Guid ApproverId, string Reason) : IRequest<Result>;

public sealed class RejectLeaveHandler(
    ILeaveRepository repo,
    IUnitOfWorkLeave uow,
    IEventBus eventBus) : IRequestHandler<RejectLeaveCommand, Result>
{
    public async Task<Result> Handle(RejectLeaveCommand cmd, CancellationToken ct)
    {
        var request = await repo.GetRequestByIdAsync(cmd.LeaveRequestId, ct);
        if (request is null) return Result.Failure(Error.NotFound);

        request.Reject(cmd.ApproverId, cmd.Reason);
        await uow.SaveChangesAsync(ct);

        await eventBus.PublishAsync(new LeaveRejectedIntegrationEvent(
            request.TenantId, request.Id, request.EmployeeId, cmd.Reason), ct);

        return Result.Success();
    }
}
