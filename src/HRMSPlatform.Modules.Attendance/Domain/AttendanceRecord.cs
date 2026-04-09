using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.Attendance.Domain;

public enum AttendanceSource { Mobile, Web, Biometric, Manual }
public enum AttendanceStatus { Present, Absent, HalfDay, OnLeave, Holiday, WeekOff }

public sealed class AttendanceRecord : AggregateRoot<Guid>
{
    private AttendanceRecord() { }

    public Guid TenantId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public DateOnly Date { get; private set; }

    public DateTime? CheckIn { get; private set; }
    public DateTime? CheckOut { get; private set; }

    // Geo-fence data
    public double? CheckInLat { get; private set; }
    public double? CheckInLng { get; private set; }
    public double? CheckOutLat { get; private set; }
    public double? CheckOutLng { get; private set; }
    public bool GeoValid { get; private set; }
    public string? GeoViolationReason { get; private set; }

    public AttendanceSource Source { get; private set; }
    public string? DeviceId { get; private set; }
    public bool IsRegularized { get; private set; }
    public AttendanceStatus Status { get; private set; }

    public double WorkingMinutes => CheckIn.HasValue && CheckOut.HasValue
        ? (CheckOut.Value - CheckIn.Value).TotalMinutes
        : 0;

    public double OvertimeMinutes { get; private set; }

    public static AttendanceRecord CreateCheckIn(
        Guid tenantId, Guid employeeId, DateOnly date,
        DateTime checkInTime, double? lat, double? lng,
        bool geoValid, string? geoViolationReason,
        AttendanceSource source, string? deviceId)
    {
        var record = new AttendanceRecord
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EmployeeId = employeeId,
            Date = date,
            CheckIn = checkInTime,
            CheckInLat = lat,
            CheckInLng = lng,
            GeoValid = geoValid,
            GeoViolationReason = geoViolationReason,
            Source = source,
            DeviceId = deviceId,
            Status = AttendanceStatus.Present
        };

        if (!geoValid)
            record.AddDomainEvent(new Events.GeoFenceViolationEvent(
                record.Id, tenantId, employeeId, lat, lng, geoViolationReason));

        return record;
    }

    public void RecordCheckOut(DateTime checkOutTime, double? lat, double? lng, double shiftDurationMinutes)
    {
        CheckOut = checkOutTime;
        CheckOutLat = lat;
        CheckOutLng = lng;

        // Calculate overtime (working minutes beyond shift)
        var worked = (checkOutTime - CheckIn!.Value).TotalMinutes;
        OvertimeMinutes = Math.Max(0, worked - shiftDurationMinutes);

        if (worked < shiftDurationMinutes * 0.5)
            Status = AttendanceStatus.HalfDay;
    }

    public void Regularize()
    {
        IsRegularized = true;
        if (!CheckIn.HasValue) CheckIn = Date.ToDateTime(TimeOnly.Parse("09:00"));
        if (!CheckOut.HasValue) CheckOut = Date.ToDateTime(TimeOnly.Parse("18:00"));
        Status = AttendanceStatus.Present;
    }

    public void MarkOnLeave() => Status = AttendanceStatus.OnLeave;
    public void MarkHoliday() => Status = AttendanceStatus.Holiday;
}

public sealed class OfficeLocation : AggregateRoot<Guid>
{
    private OfficeLocation() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public int RadiusMeters { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static OfficeLocation Create(Guid tenantId, string name, double lat, double lng, int radiusM) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, Name = name,
            Latitude = lat, Longitude = lng, RadiusMeters = radiusM
        };

    /// <summary>Haversine distance check.</summary>
    public bool IsWithinFence(double lat, double lng)
    {
        const double R = 6371000; // Earth radius in meters
        var lat1 = Latitude * Math.PI / 180;
        var lat2 = lat * Math.PI / 180;
        var dLat = (lat - Latitude) * Math.PI / 180;
        var dLng = (lng - Longitude) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c <= RadiusMeters;
    }
}

public sealed class Shift : AggregateRoot<Guid>
{
    private Shift() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }
    public int GraceMinutes { get; private set; }
    public double OvertimeAfterMinutes { get; private set; }
    public bool IsFlexible { get; private set; }
    public double? FlexibleHours { get; private set; }

    public double ShiftDurationMinutes =>
        IsFlexible
            ? (FlexibleHours ?? 8) * 60
            : (EndTime - StartTime).TotalMinutes;

    public static Shift Create(Guid tenantId, string name, TimeOnly start, TimeOnly end, int graceMinutes = 15) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, Name = name,
            StartTime = start, EndTime = end, GraceMinutes = graceMinutes,
            OvertimeAfterMinutes = (end - start).TotalMinutes
        };

    public static Shift CreateFlexible(Guid tenantId, string name, double hoursPerDay) =>
        new()
        {
            Id = Guid.NewGuid(), TenantId = tenantId, Name = name,
            IsFlexible = true, FlexibleHours = hoursPerDay,
            StartTime = TimeOnly.MinValue, EndTime = TimeOnly.MinValue
        };
}
