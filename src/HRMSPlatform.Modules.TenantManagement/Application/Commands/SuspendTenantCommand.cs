using HRMSPlatform.Modules.TenantManagement.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;

namespace HRMSPlatform.Modules.TenantManagement.Application.Commands;

public record SuspendTenantCommand(Guid TenantId, string Reason) : IRequest<Result>;

public sealed class SuspendTenantHandler(ITenantRepository repo, IUnitOfWorkTenant uow)
    : IRequestHandler<SuspendTenantCommand, Result>
{
    public async Task<Result> Handle(SuspendTenantCommand cmd, CancellationToken ct)
    {
        var tenant = await repo.GetByIdAsync(cmd.TenantId, ct);
        if (tenant is null) return Result.Failure(Error.NotFound);

        tenant.Suspend(cmd.Reason);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
