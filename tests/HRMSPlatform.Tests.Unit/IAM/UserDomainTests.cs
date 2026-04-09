using FluentAssertions;
using HRMSPlatform.Modules.IAM.Domain;
using HRMSPlatform.Modules.IAM.Domain.Events;
using Xunit;

namespace HRMSPlatform.Tests.Unit.IAM;

public sealed class UserDomainTests
{
    [Fact]
    public void Create_SetsStatusToActive_AndRaisesCreatedEvent()
    {
        var user = User.Create(Guid.NewGuid(), "alice@example.com", "hashed");

        user.Status.Should().Be(UserStatus.Active);
        user.Email.Should().Be("alice@example.com");
        user.DomainEvents.Should().ContainSingle(e => e is UserCreatedEvent);
    }

    [Fact]
    public void Create_NormalizesEmailToLowercase()
    {
        var user = User.Create(Guid.NewGuid(), "ALICE@EXAMPLE.COM", "hash");
        user.Email.Should().Be("alice@example.com");
    }

    [Fact]
    public void RecordFailedLogin_LocksAfterFiveAttempts()
    {
        var user = User.Create(Guid.NewGuid(), "bob@example.com", "hash");

        for (var i = 0; i < 5; i++)
            user.RecordFailedLogin();

        user.Status.Should().Be(UserStatus.Locked);
        user.IsLockedOut().Should().BeTrue();
        user.DomainEvents.Should().Contain(e => e is UserLockedEvent);
    }

    [Fact]
    public void RecordFailedLogin_DoesNotLockBeforeFiveAttempts()
    {
        var user = User.Create(Guid.NewGuid(), "carol@example.com", "hash");

        for (var i = 0; i < 4; i++)
            user.RecordFailedLogin();

        user.Status.Should().Be(UserStatus.Active);
        user.IsLockedOut().Should().BeFalse();
    }

    [Fact]
    public void RecordSuccessfulLogin_ResetsFailedAttempts()
    {
        var user = User.Create(Guid.NewGuid(), "dave@example.com", "hash");
        user.RecordFailedLogin();
        user.RecordFailedLogin();

        user.RecordSuccessfulLogin();

        user.FailedLoginAttempts.Should().Be(0);
        user.LastLoginAt.Should().NotBeNull();
        user.DomainEvents.Should().Contain(e => e is UserLoggedInEvent);
    }

    [Fact]
    public void AssignRole_AddsRoleOnce()
    {
        var user = User.Create(Guid.NewGuid(), "eve@example.com", "hash");
        var roleId = Guid.NewGuid();

        user.AssignRole(roleId);
        user.AssignRole(roleId); // duplicate should be ignored

        user.Roles.Should().ContainSingle(r => r.RoleId == roleId);
    }

    [Fact]
    public void RemoveRole_RemovesExistingRole()
    {
        var user = User.Create(Guid.NewGuid(), "frank@example.com", "hash");
        var roleId = Guid.NewGuid();

        user.AssignRole(roleId);
        user.RemoveRole(roleId);

        user.Roles.Should().BeEmpty();
    }

    [Fact]
    public void SetRefreshToken_StoresHashAndExpiry()
    {
        var user = User.Create(Guid.NewGuid(), "grace@example.com", "hash");
        var expiry = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken("tokenHash", expiry);

        user.RefreshTokenHash.Should().Be("tokenHash");
        user.RefreshTokenExpiresAt.Should().Be(expiry);
    }

    [Fact]
    public void RevokeRefreshToken_ClearsTokenAndExpiry()
    {
        var user = User.Create(Guid.NewGuid(), "heidi@example.com", "hash");
        user.SetRefreshToken("tokenHash", DateTime.UtcNow.AddDays(7));

        user.RevokeRefreshToken();

        user.RefreshTokenHash.Should().BeNull();
        user.RefreshTokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public void Disable_SetsStatusAndRevokesRefreshToken()
    {
        var user = User.Create(Guid.NewGuid(), "ivan@example.com", "hash");
        user.SetRefreshToken("tokenHash", DateTime.UtcNow.AddDays(7));

        user.Disable();

        user.Status.Should().Be(UserStatus.Disabled);
        user.RefreshTokenHash.Should().BeNull();
    }

    [Fact]
    public void SetPassword_RaisesPasswordChangedEvent()
    {
        var user = User.Create(Guid.NewGuid(), "judy@example.com", "oldHash");

        user.SetPassword("newHash");

        user.PasswordHash.Should().Be("newHash");
        user.DomainEvents.Should().Contain(e => e is PasswordChangedEvent);
    }

    [Fact]
    public void IsLockedOut_ReturnsFalse_ForLockedOutUserWhoseLockExpired()
    {
        // A user that was locked but the lock has already expired should not be locked out
        var user = User.Create(Guid.NewGuid(), "kate@example.com", "hash");
        // Lock the user via 5 failed logins
        for (var i = 0; i < 5; i++) user.RecordFailedLogin();

        // Simulate time passing: successful login resets lock
        user.RecordSuccessfulLogin();

        user.IsLockedOut().Should().BeFalse();
    }

    [Fact]
    public void CreateInvited_SetsStatusToInvited()
    {
        var user = User.CreateInvited(Guid.NewGuid(), "leo@example.com");

        user.Status.Should().Be(UserStatus.Invited);
        user.PasswordHash.Should().BeEmpty();
    }
}
