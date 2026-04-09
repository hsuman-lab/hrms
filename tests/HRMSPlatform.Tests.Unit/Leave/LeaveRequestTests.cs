using FluentAssertions;
using HRMSPlatform.Modules.LeaveManagement.Domain;
using Xunit;

namespace HRMSPlatform.Tests.Unit.Leave;

public sealed class LeaveRequestTests
{
    [Fact]
    public void Create_SetsStatusToPending()
    {
        var request = LeaveRequest.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            new DateOnly(2025, 6, 1), new DateOnly(2025, 6, 3), 3, "Annual vacation");

        request.Status.Should().Be(LeaveRequestStatus.Pending);
        request.DaysCount.Should().Be(3);
    }

    [Fact]
    public void Approve_ChangesStatusToApproved()
    {
        var request = LeaveRequest.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            new DateOnly(2025, 6, 1), new DateOnly(2025, 6, 3), 3, "Annual vacation");

        var approverId = Guid.NewGuid();
        request.Approve(approverId);

        request.Status.Should().Be(LeaveRequestStatus.Approved);
        request.ApproverId.Should().Be(approverId);
    }

    [Fact]
    public void Reject_ChangesStatusToRejected_WithReason()
    {
        var request = LeaveRequest.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            new DateOnly(2025, 6, 1), new DateOnly(2025, 6, 3), 3, "Vacation");

        request.Reject(Guid.NewGuid(), "Critical project deadline");

        request.Status.Should().Be(LeaveRequestStatus.Rejected);
        request.RejectionReason.Should().Be("Critical project deadline");
    }

    [Fact]
    public void Approve_RaisesLeaveApprovedDomainEvent()
    {
        var request = LeaveRequest.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            new DateOnly(2025, 6, 1), new DateOnly(2025, 6, 5), 5, "Leave");

        request.Approve(Guid.NewGuid());

        request.DomainEvents.Should().ContainSingle(e =>
            e is Domain.Events.LeaveApprovedEvent);
    }

    [Fact]
    public void LeaveBalance_ClosingBalance_IsCalculatedCorrectly()
    {
        var balance = new LeaveBalance
        {
            EmployeeId = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            LeaveTypeId = Guid.NewGuid(),
            Year = 2025,
            OpeningBalance = 5,
            Accrued = 12,
            Used = 8,
            Adjusted = 0
        };

        balance.ClosingBalance.Should().Be(9);  // 5 + 12 - 8 + 0
    }
}
