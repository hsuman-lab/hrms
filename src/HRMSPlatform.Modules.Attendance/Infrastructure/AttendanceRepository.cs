using HRMSPlatform.Modules.Attendance.Domain;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Attendance.Infrastructure;

public interface IAttendanceRepository
{
    Task<AttendanceRecord?> GetTodayRecordAsync(Guid employeeId, DateOnly date, CancellationToken ct = default);
    Task<List<AttendanceRecord>> GetMonthlyAsync(Guid employeeId, int year, int month, CancellationToken ct = default);
    Task<Shift?> GetEmployeeShiftAsync(Guid employeeId, CancellationToken ct = default);
    Task<List<OfficeLocation>> GetActiveLocationsAsync(CancellationToken ct = default);
    Task AddAsync(AttendanceRecord record, CancellationToken ct = default);
}

public interface IUnitOfWorkAttendance
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface IGeoFenceService
{
    Task<(bool IsValid, string? ViolationReason)> ValidateAsync(
        Guid tenantId, double? lat, double? lng, CancellationToken ct = default);
}

public sealed class AttendanceRepository(AttendanceDbContext db, ITenantContext tenant)
    : IAttendanceRepository, IUnitOfWorkAttendance
{
    public Task<AttendanceRecord?> GetTodayRecordAsync(Guid employeeId, DateOnly date, CancellationToken ct = default) =>
        db.AttendanceRecords
            .Where(r => r.TenantId == tenant.TenantId && r.EmployeeId == employeeId && r.Date == date)
            .FirstOrDefaultAsync(ct);

    public Task<List<AttendanceRecord>> GetMonthlyAsync(Guid employeeId, int year, int month, CancellationToken ct = default) =>
        db.AttendanceRecords
            .Where(r => r.TenantId == tenant.TenantId && r.EmployeeId == employeeId &&
                        r.Date.Year == year && r.Date.Month == month)
            .OrderBy(r => r.Date)
            .ToListAsync(ct);

    public async Task<Shift?> GetEmployeeShiftAsync(Guid employeeId, CancellationToken ct = default) =>
        await db.Shifts.Where(s => s.TenantId == tenant.TenantId).FirstOrDefaultAsync(ct);

    public Task<List<OfficeLocation>> GetActiveLocationsAsync(CancellationToken ct = default) =>
        db.OfficeLocations
            .Where(l => l.TenantId == tenant.TenantId && l.IsActive)
            .ToListAsync(ct);

    public async Task AddAsync(AttendanceRecord record, CancellationToken ct = default) =>
        await db.AttendanceRecords.AddAsync(record, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}

public sealed class GeoFenceService(IAttendanceRepository repo) : IGeoFenceService
{
    public async Task<(bool IsValid, string? ViolationReason)> ValidateAsync(
        Guid tenantId, double? lat, double? lng, CancellationToken ct = default)
    {
        if (!lat.HasValue || !lng.HasValue)
            return (false, "GPS coordinates not provided.");

        var locations = await repo.GetActiveLocationsAsync(ct);
        if (!locations.Any())
            return (true, null); // No geo-fence configured → allow all

        foreach (var loc in locations)
        {
            if (loc.IsWithinFence(lat.Value, lng.Value))
                return (true, null);
        }

        return (false, $"Check-in location is outside all registered office geo-fences.");
    }
}
