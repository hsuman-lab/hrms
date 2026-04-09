using HRMSPlatform.Modules.EmployeeManagement.Application.Commands;
using HRMSPlatform.Modules.EmployeeManagement.Application.Queries;
using HRMSPlatform.Modules.EmployeeManagement.Domain;
using HRMSPlatform.SharedKernel.Common;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.EmployeeManagement.Infrastructure;

public interface IEmployeeRepository
{
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<EmployeeDetailDto?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<PagedList<EmployeeDto>> ListAsync(string? deptId, string? status, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<string> GenerateNextEmployeeNumberAsync(Guid tenantId, CancellationToken ct = default);
    Task AddAsync(Employee employee, CancellationToken ct = default);
    Task UpdateAsync(Employee employee, CancellationToken ct = default);
}

public interface IUnitOfWorkEmployee
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public sealed class EmployeeRepository(EmployeeDbContext db, ITenantContext tenant)
    : IEmployeeRepository, IUnitOfWorkEmployee
{
    public Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Employees
            .Where(e => e.TenantId == tenant.TenantId && e.Id == id)
            .FirstOrDefaultAsync(ct);

    public async Task<EmployeeDetailDto?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default)
    {
        var emp = await db.Employees
            .Where(e => e.TenantId == tenant.TenantId && e.Id == id)
            .FirstOrDefaultAsync(ct);
        if (emp is null) return null;

        var dept = emp.DepartmentId.HasValue
            ? await db.Departments.FindAsync([emp.DepartmentId.Value], ct)
            : null;
        var pos = emp.PositionId.HasValue
            ? await db.Positions.FindAsync([emp.PositionId.Value], ct)
            : null;
        var manager = emp.ReportsToId.HasValue
            ? await db.Employees.FindAsync([emp.ReportsToId.Value], ct)
            : null;

        return new EmployeeDetailDto(
            emp.Id, emp.EmployeeNumber, emp.FirstName, emp.LastName, emp.FullName,
            emp.Status.ToString(), emp.EmploymentType.ToString(),
            emp.HireDate, emp.ExitDate,
            emp.DepartmentId, dept?.Name,
            emp.PositionId, pos?.Title,
            emp.ReportsToId, manager?.FullName,
            emp.CreatedAt, emp.UpdatedAt);
    }

    public async Task<PagedList<EmployeeDto>> ListAsync(
        string? deptId, string? status, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.Employees.Where(e => e.TenantId == tenant.TenantId);

        if (!string.IsNullOrEmpty(deptId) && Guid.TryParse(deptId, out var dId))
            query = query.Where(e => e.DepartmentId == dId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<EmployeeStatus>(status, true, out var s))
            query = query.Where(e => e.Status == s);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(e =>
                EF.Functions.ILike(e.FirstName + " " + e.LastName, $"%{search}%") ||
                EF.Functions.ILike(e.EmployeeNumber, $"%{search}%"));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(e => new EmployeeDto(e.Id, e.EmployeeNumber, e.FullName,
                e.Status.ToString(), e.EmploymentType.ToString(), e.HireDate, e.DepartmentId, e.PositionId, e.CreatedAt))
            .ToListAsync(ct);

        return new PagedList<EmployeeDto>(items, total, page, pageSize);
    }

    public async Task<string> GenerateNextEmployeeNumberAsync(Guid tenantId, CancellationToken ct = default)
    {
        var count = await db.Employees.CountAsync(e => e.TenantId == tenantId, ct);
        return $"EMP{(count + 1):D6}";
    }

    public async Task AddAsync(Employee employee, CancellationToken ct = default) =>
        await db.Employees.AddAsync(employee, ct);

    public Task UpdateAsync(Employee employee, CancellationToken ct = default)
    {
        db.Employees.Update(employee);
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}
