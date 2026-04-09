using HRMSPlatform.SharedKernel.Domain;
using HRMSPlatform.Modules.IAM.Domain.Events;

namespace HRMSPlatform.Modules.IAM.Domain;

public enum UserStatus { Active, Locked, Invited, Disabled }

public sealed class User : AggregateRoot<Guid>
{
    private User() { }

    public Guid TenantId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserStatus Status { get; private set; }
    public string? MfaSecret { get; private set; }
    public bool MfaEnabled { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockedUntil { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? RefreshTokenHash { get; private set; }
    public DateTime? RefreshTokenExpiresAt { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private readonly List<UserRole> _roles = [];
    public IReadOnlyCollection<UserRole> Roles => _roles.AsReadOnly();

    public static User Create(Guid tenantId, string email, string passwordHash)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        user.AddDomainEvent(new UserCreatedEvent(user.Id, tenantId, email));
        return user;
    }

    public static User CreateInvited(Guid tenantId, string email)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Email = email.ToLowerInvariant(),
            PasswordHash = string.Empty,
            Status = UserStatus.Invited,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        return user;
    }

    public void RecordSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockedUntil = null;
        LastLoginAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new UserLoggedInEvent(Id, TenantId));
    }

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= 5)
        {
            Status = UserStatus.Locked;
            LockedUntil = DateTime.UtcNow.AddMinutes(30);
            AddDomainEvent(new UserLockedEvent(Id, TenantId));
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsLockedOut() => Status == UserStatus.Locked && LockedUntil > DateTime.UtcNow;

    public void SetRefreshToken(string tokenHash, DateTime expiresAt)
    {
        RefreshTokenHash = tokenHash;
        RefreshTokenExpiresAt = expiresAt;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RevokeRefreshToken()
    {
        RefreshTokenHash = null;
        RefreshTokenExpiresAt = null;
    }

    public void AssignRole(Guid roleId, Guid? departmentId = null)
    {
        if (_roles.Any(r => r.RoleId == roleId)) return;
        _roles.Add(new UserRole { UserId = Id, RoleId = roleId, TenantId = TenantId, DepartmentId = departmentId });
    }

    public void RemoveRole(Guid roleId) => _roles.RemoveAll(r => r.RoleId == roleId);

    public void SetPassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        UpdatedAt = DateTime.UtcNow;
        AddDomainEvent(new PasswordChangedEvent(Id, TenantId));
    }

    public void Disable()
    {
        Status = UserStatus.Disabled;
        RevokeRefreshToken();
        UpdatedAt = DateTime.UtcNow;
    }
}

public sealed class UserRole
{
    public Guid UserId { get; init; }
    public Guid RoleId { get; init; }
    public Guid TenantId { get; init; }
    public Guid? DepartmentId { get; init; }
    public DateTime AssignedAt { get; init; } = DateTime.UtcNow;
}
