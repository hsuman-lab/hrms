using HRMSPlatform.Modules.Attendance.Application.Commands;
using HRMSPlatform.Modules.Attendance.Domain;
using HRMSPlatform.Modules.Attendance.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.Attendance.API;

[ApiController]
[Route("api/v1/attendance")]
[Authorize]
public sealed class AttendanceController(
    ISender mediator,
    IAttendanceRepository repo,
    ITenantContext tenant) : ControllerBase
{
    /// <summary>
    /// Clock in. Validates geo-fence, device attestation, and timestamp freshness.
    /// </summary>
    [HttpPost("checkin")]
    [ProducesResponseType(typeof(AttendanceDto), 200)]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest req, CancellationToken ct)
    {
        // Timestamp freshness check (±5 minutes)
        if (Math.Abs((DateTime.UtcNow - req.ClientTimestamp).TotalMinutes) > 5)
            return BadRequest(new { error = "Client timestamp is too far from server time." });

        var result = await mediator.Send(new CheckInCommand(
            req.EmployeeId, req.Latitude, req.Longitude,
            req.GpsAccuracyMeters, req.DeviceId, req.DeviceAttestationToken,
            req.Source), ct);

        return result.IsFailure
            ? BadRequest(new { error = result.Error.Description })
            : Ok(result.Value);
    }

    /// <summary>Clock out.</summary>
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(AttendanceDto), 200)]
    public async Task<IActionResult> CheckOut([FromBody] CheckOutRequest req, CancellationToken ct)
    {
        var result = await mediator.Send(
            new CheckOutCommand(req.EmployeeId, req.Latitude, req.Longitude, req.DeviceId), ct);

        return result.IsFailure
            ? BadRequest(new { error = result.Error.Description })
            : Ok(result.Value);
    }

    /// <summary>Get attendance records for an employee in a month.</summary>
    [HttpGet("records")]
    public async Task<IActionResult> GetMonthly(
        [FromQuery] Guid employeeId,
        [FromQuery] int year,
        [FromQuery] int month,
        CancellationToken ct)
    {
        var records = await repo.GetMonthlyAsync(employeeId, year, month, ct);
        return Ok(records.Select(r => new
        {
            r.Id, r.Date, r.CheckIn, r.CheckOut, r.GeoValid,
            r.WorkingMinutes, r.OvertimeMinutes, r.Status, r.Source
        }));
    }

    /// <summary>Add / update an office location geo-fence.</summary>
    [HttpPost("locations")]
    [Authorize(Roles = "HR_ADMIN")]
    public IActionResult AddLocation([FromBody] LocationRequest req)
    {
        var location = OfficeLocation.Create(
            tenant.TenantId, req.Name, req.Latitude, req.Longitude, req.RadiusMeters);
        return Created($"api/v1/attendance/locations/{location.Id}", location.Id);
    }
}

public record CheckInRequest(
    Guid EmployeeId,
    double? Latitude,
    double? Longitude,
    double? GpsAccuracyMeters,
    string? DeviceId,
    string? DeviceAttestationToken,
    DateTime ClientTimestamp,
    AttendanceSource Source = AttendanceSource.Mobile);

public record CheckOutRequest(
    Guid EmployeeId,
    double? Latitude,
    double? Longitude,
    string? DeviceId);

public record LocationRequest(string Name, double Latitude, double Longitude, int RadiusMeters);
