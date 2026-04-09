using HRMSPlatform.Infrastructure.Security;
using HRMSPlatform.Modules.IAM.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using MediatR;

namespace HRMSPlatform.Modules.IAM.Application.Commands;

public record RefreshTokenCommand(Guid UserId, string RefreshToken) : IRequest<Result<AuthTokensDto>>;

public sealed class RefreshTokenHandler(
    IUserRepository userRepo,
    IRoleRepository roleRepo,
    JwtService jwtService,
    IUnitOfWorkIam uow) : IRequestHandler<RefreshTokenCommand, Result<AuthTokensDto>>
{
    public async Task<Result<AuthTokensDto>> Handle(RefreshTokenCommand cmd, CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(cmd.UserId, ct);
        if (user is null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
            return Result.Failure<AuthTokensDto>(Error.Unauthorized);

        if (!BCrypt.Net.BCrypt.Verify(cmd.RefreshToken, user.RefreshTokenHash))
            return Result.Failure<AuthTokensDto>(Error.Unauthorized);

        var roles = await roleRepo.GetUserRolesAsync(user.Id, ct);
        var roleNames = roles.Select(r => r.Name).ToArray();
        var permissions = roles.SelectMany(r => r.Permissions)
            .Select(p => $"{p.Resource}:{p.Action}:{p.Scope}").Distinct().ToArray();

        var newAccess = jwtService.GenerateAccessToken(user.Id, user.TenantId, string.Empty, roleNames, permissions);
        var newRefresh = jwtService.GenerateRefreshToken();
        user.SetRefreshToken(BCrypt.Net.BCrypt.HashPassword(newRefresh), DateTime.UtcNow.AddDays(7));
        await uow.SaveChangesAsync(ct);

        return new AuthTokensDto(newAccess, newRefresh, DateTime.UtcNow.AddMinutes(15), roleNames);
    }
}
