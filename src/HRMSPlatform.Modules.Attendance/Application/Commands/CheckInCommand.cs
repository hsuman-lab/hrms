using HRMSPlatform.Modules.Attendance.Domain;
using HRMSPlatform.Modules.Attendance.Domain.Events;
using HRMSPlatform.Modules.Attendance.Infrastructure;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.Interfaces;
using HRMSPlatform.SharedKernel.MultiTenancy;
using MediatR;

namespace HRMSPlatform.Modules.Attendance.Application.Commands;

public record CheckInCommand(
    Guid EmployeeId,
    double? Latitude,
    double? Longitude,
    double? GpsAccuracyMeters,
    string? DeviceId,
    string? DeviceAttestationToken,
    AttendanceSource Source = AttendanceSource.Mobile) : IRequest<Result<AttendanceDto>>;

public record AttendanceDto(Guid Id, Guid EmployeeId, DateOnly Date,
    DateTime? CheckIn, DateTime? CheckOut, bool GeoValid, double WorkingMinutes,
    AttendanceSource Source, AttendanceStatus Status);

public sealed class CheckInHandler(
    IAttendanceRepository repo,
    IGeoFenceService geoFence,
    ITenantContext tenant,
    IUnitOfWorkAttendance uow,
    IEventBus eventBus) : IRequestHandler<CheckInCommand, Result<AttendanceDto>>
{
    public async Task<Result<AttendanceDto>> Handle(CheckInCommand cmd, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Idempotency — one check-in per employee per day
        var existing = await repo.GetTodayRecordAsync(cmd.EmployeeId, today, ct);
        if (existing?.CheckIn is not null)
            return Result.Failure<AttendanceDto>(
                Error.Custom("ALREADY_CHECKED_IN", "Employee has already checked in today."));

        // Reject low accuracy GPS
        if (cmd.GpsAccuracyMeters.HasValue && cmd.GpsAccuracyMeters > 150)
            return Result.Failure<AttendanceDto>(
                Error.Custom("GPS_INACCURATE", "GPS accuracy too low. Move to a better location."));

        // Geo-fence validation
        var (geoValid, violationReason) = await geoFence.ValidateAsync(
            tenant.TenantId, cmd.Latitude, cmd.Longitude, ct);

        var record = AttendanceRecord.CreateCheckIn(
            tenant.TenantId, cmd.EmployeeId, today,
            DateTime.UtcNow, cmd.Latitude, cmd.Longitude,
            geoValid, violationReason, cmd.Source, cmd.DeviceId);

        await repo.AddAsync(record, ct);
        await uow.SaveChangesAsync(ct);

        if (!geoValid)
            await eventBus.PublishAsync(
                new GeoFenceViolationIntegrationEvent(tenant.TenantId, cmd.EmployeeId, cmd.Latitude, cmd.Longitude), ct);

        return ToDto(record);
    }

    private static AttendanceDto ToDto(AttendanceRecord r) =>
        new(r.Id, r.EmployeeId, r.Date, r.CheckIn, r.CheckOut, r.GeoValid,
            r.WorkingMinutes, r.Source, r.Status);
}

public record CheckOutCommand(
    Guid EmployeeId,
    double? Latitude,
    double? Longitude,
    string? DeviceId) : IRequest<Result<AttendanceDto>>;

public sealed class CheckOutHandler(
    IAttendanceRepository repo,
    IUnitOfWorkAttendance uow,
    IEventBus eventBus,
    ITenantContext tenant) : IRequestHandler<CheckOutCommand, Result<AttendanceDto>>
{
    public async Task<Result<AttendanceDto>> Handle(CheckOutCommand cmd, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var record = await repo.GetTodayRecordAsync(cmd.EmployeeId, today, ct);

        if (record is null || record.CheckIn is null)
            return Result.Failure<AttendanceDto>(Error.Custom("NOT_CHECKED_IN", "No check-in found for today."));

        if (record.CheckOut is not null)
            return Result.Failure<AttendanceDto>(Error.Custom("ALREADY_CHECKED_OUT", "Already checked out."));

        var shift = await repo.GetEmployeeShiftAsync(cmd.EmployeeId, ct);
        record.RecordCheckOut(DateTime.UtcNow, cmd.Latitude, cmd.Longitude, shift?.ShiftDurationMinutes ?? 480);

        await uow.SaveChangesAsync(ct);

        await eventBus.PublishAsync(new AttendanceMarkedIntegrationEvent(
            tenant.TenantId, cmd.EmployeeId, today,
            record.Status == AttendanceStatus.Present, record.WorkingMinutes, record.OvertimeMinutes), ct);

        return new AttendanceDto(record.Id, record.EmployeeId, record.Date,
            record.CheckIn, record.CheckOut, record.GeoValid, record.WorkingMinutes, record.Source, record.Status);
    }
}
