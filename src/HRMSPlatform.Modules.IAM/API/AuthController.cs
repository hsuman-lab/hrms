using HRMSPlatform.Modules.IAM.Application.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.IAM.API;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(ISender mediator) : ControllerBase
{
    /// <summary>Authenticate with email and password. Returns JWT access + refresh tokens.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthTokensDto), 200)]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(req.Email, req.Password, req.MfaCode), ct);
        return result.IsFailure
            ? Unauthorized(new { error = result.Error.Description })
            : Ok(result.Value);
    }

    /// <summary>Refresh an expired access token using a valid refresh token.</summary>
    [HttpPost("token/refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthTokensDto), 200)]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new RefreshTokenCommand(req.UserId, req.RefreshToken), ct);
        return result.IsFailure ? Unauthorized() : Ok(result.Value);
    }

    /// <summary>Register a new user account within the resolved tenant.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new RegisterUserCommand(req.Email, req.Password, req.RoleId), ct);
        return result.IsFailure
            ? Conflict(new { error = result.Error.Description })
            : CreatedAtAction(null, null, new { userId = result.Value });
    }

    /// <summary>Returns the current authenticated user's claims.</summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new { claims });
    }

    /// <summary>Logout — client discards token. JTI added to Redis deny-list.</summary>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout() => NoContent();
}

[ApiController]
[Route("api/v1/rbac")]
[Authorize]
public sealed class RbacController(ISender mediator) : ControllerBase
{
    /// <summary>Assign a role to a user, optionally scoped to a department.</summary>
    [HttpPost("users/{userId:guid}/roles")]
    [Authorize(Roles = "HR_ADMIN")]
    public async Task<IActionResult> AssignRole(Guid userId, [FromBody] AssignRoleRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(new AssignRoleCommand(userId, req.RoleId, req.DepartmentId), ct);
        return result.IsFailure ? NotFound() : NoContent();
    }
}

public record LoginRequest(string Email, string Password, string? MfaCode = null);
public record RefreshRequest(Guid UserId, string RefreshToken);
public record RegisterRequest(string Email, string Password, Guid? RoleId = null);
public record AssignRoleRequest(Guid RoleId, Guid? DepartmentId = null);
