using HRMSPlatform.Modules.IAM.Domain;
using HRMSPlatform.Modules.IAM.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;

namespace HRMSPlatform.Modules.IAM.Application.Commands;

public record RegisterUserCommand(string Email, string Password, Guid? RoleId = null) : IRequest<Result<Guid>>;

public sealed class RegisterUserHandler(
    IUserRepository userRepo,
    ITenantContext tenant,
    IUnitOfWorkIam uow) : IRequestHandler<RegisterUserCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(RegisterUserCommand cmd, CancellationToken ct)
    {
        var existing = await userRepo.FindByEmailAsync(cmd.Email, ct);
        if (existing is not null)
            return Result.Failure<Guid>(Error.Conflict);

        var hash = BCrypt.Net.BCrypt.HashPassword(cmd.Password, workFactor: 12);
        var user = User.Create(tenant.TenantId, cmd.Email, hash);

        if (cmd.RoleId.HasValue)
            user.AssignRole(cmd.RoleId.Value);

        await userRepo.AddAsync(user, ct);
        await uow.SaveChangesAsync(ct);
        return user.Id;
    }
}
