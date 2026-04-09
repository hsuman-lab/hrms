using FluentAssertions;
using HRMSPlatform.Modules.Attendance.Domain;
using Xunit;

namespace HRMSPlatform.Tests.Unit.Attendance;

public sealed class GeoFenceTests
{
    [Fact]
    public void IsWithinFence_WhenInsideRadius_ReturnsTrue()
    {
        var office = OfficeLocation.Create(Guid.NewGuid(), "HQ", 19.0760m, 72.8777m, 200);
        // Same coordinates — distance = 0
        office.IsWithinFence(19.0760, 72.8777).Should().BeTrue();
    }

    [Fact]
    public void IsWithinFence_WhenOutsideRadius_ReturnsFalse()
    {
        var office = OfficeLocation.Create(Guid.NewGuid(), "HQ", 19.0760m, 72.8777m, 100);
        // ~5km away
        office.IsWithinFence(19.1260, 72.8777).Should().BeFalse();
    }

    [Fact]
    public void IsWithinFence_EdgeOfRadius_ReturnsTrue()
    {
        var office = OfficeLocation.Create(Guid.NewGuid(), "HQ", 19.0760m, 72.8777m, 200);
        // ~150m away (within 200m radius)
        office.IsWithinFence(19.0774, 72.8777).Should().BeTrue();
    }

    [Theory]
    [InlineData(19.0760, 72.8777, true)]   // exact match
    [InlineData(19.0762, 72.8779, true)]   // very close
    [InlineData(20.0000, 73.0000, false)]  // far away
    public void IsWithinFence_VariousLocations(double lat, double lng, bool expected)
    {
        var office = OfficeLocation.Create(Guid.NewGuid(), "Office", 19.0760m, 72.8777m, 300);
        office.IsWithinFence(lat, lng).Should().Be(expected);
    }
}
