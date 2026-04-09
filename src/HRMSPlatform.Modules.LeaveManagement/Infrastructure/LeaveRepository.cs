using HRMSPlatform.Modules.LeaveManagement.Domain;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.LeaveManagement.Infrastructure;

public interface ILeaveRepository
{
    Task<LeaveRequest?> GetRequestByIdAsync(Guid id, CancellationToken ct = default);
    Task<LeaveBalance?> GetBalanceAsync(Guid employeeId, Guid leaveTypeId, int year, CancellationToken ct = default);
    Task<List<LeaveBalance>> GetAllBalancesAsync(Guid employeeId, CancellationToken ct = default);
    Task AddRequestAsync(LeaveRequest request, CancellationToken ct = default);
    Task<List<LeaveRequest>> GetPendingForApproverAsync(Guid approverId, CancellationToken ct = default);
}

public interface IUnitOfWorkLeave
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public sealed class LeaveRepository(LeaveDbContext db, ITenantContext tenant)
    : ILeaveRepository, IUnitOfWorkLeave
{
    public Task<LeaveRequest?> GetRequestByIdAsync(Guid id, CancellationToken ct = default) =>
        db.LeaveRequests
            .Where(r => r.TenantId == tenant.TenantId && r.Id == id)
            .FirstOrDefaultAsync(ct);

    public Task<LeaveBalance?> GetBalanceAsync(Guid employeeId, Guid leaveTypeId, int year, CancellationToken ct = default) =>
        db.LeaveBalances
            .Where(b => b.TenantId == tenant.TenantId &&
                        b.EmployeeId == employeeId &&
                        b.LeaveTypeId == leaveTypeId &&
                        b.Year == year)
            .FirstOrDefaultAsync(ct);

    public Task<List<LeaveBalance>> GetAllBalancesAsync(Guid employeeId, CancellationToken ct = default) =>
        db.LeaveBalances
            .Where(b => b.TenantId == tenant.TenantId && b.EmployeeId == employeeId)
            .ToListAsync(ct);

    public async Task AddRequestAsync(LeaveRequest request, CancellationToken ct = default) =>
        await db.LeaveRequests.AddAsync(request, ct);

    public Task<List<LeaveRequest>> GetPendingForApproverAsync(Guid approverId, CancellationToken ct = default) =>
        db.LeaveRequests
            .Where(r => r.TenantId == tenant.TenantId && r.Status == LeaveRequestStatus.Pending)
            .ToListAsync(ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}
