using HRMSPlatform.Infrastructure.Security;
using HRMSPlatform.Modules.IAM.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using MediatR;

namespace HRMSPlatform.Modules.IAM.Application.Commands;

public record LoginCommand(string Email, string Password, string? MfaCode = null) : IRequest<Result<AuthTokensDto>>;

public record AuthTokensDto(string AccessToken, string RefreshToken, DateTime ExpiresAt, string[] Roles);

public sealed class LoginHandler(
    IUserRepository userRepo,
    IRoleRepository roleRepo,
    JwtService jwtService,
    ICacheService cache,
    IUnitOfWorkIam uow) : IRequestHandler<LoginCommand, Result<AuthTokensDto>>
{
    public async Task<Result<AuthTokensDto>> Handle(LoginCommand cmd, CancellationToken ct)
    {
        var user = await userRepo.FindByEmailAsync(cmd.Email, ct);
        if (user is null)
            return Result.Failure<AuthTokensDto>(Error.Custom("AUTH_INVALID", "Invalid credentials."));

        if (user.IsLockedOut())
            return Result.Failure<AuthTokensDto>(Error.Custom("AUTH_LOCKED", "Account is temporarily locked."));

        if (!BCrypt.Net.BCrypt.Verify(cmd.Password, user.PasswordHash))
        {
            user.RecordFailedLogin();
            await uow.SaveChangesAsync(ct);
            return Result.Failure<AuthTokensDto>(Error.Custom("AUTH_INVALID", "Invalid credentials."));
        }

        // Get roles and permissions
        var roles = await roleRepo.GetUserRolesAsync(user.Id, ct);
        var roleNames = roles.Select(r => r.Name).ToArray();
        var permissions = roles.SelectMany(r => r.Permissions)
            .Select(p => $"{p.Resource}:{p.Action}:{p.Scope}")
            .Distinct()
            .ToArray();

        var accessToken = jwtService.GenerateAccessToken(
            user.Id, user.TenantId, string.Empty, roleNames, permissions);
        var refreshToken = jwtService.GenerateRefreshToken();
        var refreshExpiry = DateTime.UtcNow.AddDays(7);

        user.RecordSuccessfulLogin();
        user.SetRefreshToken(BCrypt.Net.BCrypt.HashPassword(refreshToken), refreshExpiry);
        await uow.SaveChangesAsync(ct);

        // Cache session
        await cache.SetAsync($"session:{user.Id}", new { user.Id, user.TenantId, roleNames },
            TimeSpan.FromMinutes(15), ct);

        return new AuthTokensDto(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(15), roleNames);
    }
}
