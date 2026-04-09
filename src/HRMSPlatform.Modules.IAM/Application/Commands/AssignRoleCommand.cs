using HRMSPlatform.Modules.IAM.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;

namespace HRMSPlatform.Modules.IAM.Application.Commands;

public record AssignRoleCommand(Guid UserId, Guid RoleId, Guid? DepartmentId = null) : IRequest<Result>;

public sealed class AssignRoleHandler(IUserRepository userRepo, IUnitOfWorkIam uow)
    : IRequestHandler<AssignRoleCommand, Result>
{
    public async Task<Result> Handle(AssignRoleCommand cmd, CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(cmd.UserId, ct);
        if (user is null) return Result.Failure(Error.NotFound);
        user.AssignRole(cmd.RoleId, cmd.DepartmentId);
        await uow.SaveChangesAsync(ct);
        return Result.Success();
    }
}
