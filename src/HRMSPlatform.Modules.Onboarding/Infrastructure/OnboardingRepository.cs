using HRMSPlatform.Modules.Onboarding.Domain;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Onboarding.Infrastructure;

public interface IOnboardingRepository
{
    Task<OnboardingTemplate?> GetTemplateAsync(Guid id, CancellationToken ct = default);
    Task<OnboardingTemplate?> GetDefaultTemplateAsync(Guid tenantId, CancellationToken ct = default);
    Task<OnboardingInstance?> GetInstanceAsync(Guid id, CancellationToken ct = default);
    Task<OnboardingInstance?> GetActiveInstanceAsync(Guid employeeId, CancellationToken ct = default);
    Task<List<OnboardingInstance>> GetByEmployeeAsync(Guid employeeId, CancellationToken ct = default);
    Task AddTemplateAsync(OnboardingTemplate template, CancellationToken ct = default);
    Task AddInstanceAsync(OnboardingInstance instance, CancellationToken ct = default);
}

public interface IUnitOfWorkOnboarding
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public sealed class OnboardingRepository(OnboardingDbContext db, ITenantContext tenant)
    : IOnboardingRepository, IUnitOfWorkOnboarding
{
    public Task<OnboardingTemplate?> GetTemplateAsync(Guid id, CancellationToken ct = default) =>
        db.Templates
            .Include(t => t.Tasks)
            .Where(t => t.TenantId == tenant.TenantId && t.Id == id)
            .FirstOrDefaultAsync(ct);

    public Task<OnboardingTemplate?> GetDefaultTemplateAsync(Guid tenantId, CancellationToken ct = default) =>
        db.Templates
            .Include(t => t.Tasks)
            .Where(t => t.TenantId == tenantId && t.IsDefault)
            .FirstOrDefaultAsync(ct);

    public Task<OnboardingInstance?> GetInstanceAsync(Guid id, CancellationToken ct = default) =>
        db.Instances
            .Include(i => i.Tasks)
            .Where(i => i.TenantId == tenant.TenantId && i.Id == id)
            .FirstOrDefaultAsync(ct);

    public Task<OnboardingInstance?> GetActiveInstanceAsync(Guid employeeId, CancellationToken ct = default) =>
        db.Instances
            .Where(i => i.TenantId == tenant.TenantId &&
                        i.EmployeeId == employeeId &&
                        i.Status == OnboardingStatus.InProgress)
            .FirstOrDefaultAsync(ct);

    public Task<List<OnboardingInstance>> GetByEmployeeAsync(Guid employeeId, CancellationToken ct = default) =>
        db.Instances
            .Include(i => i.Tasks)
            .Where(i => i.TenantId == tenant.TenantId && i.EmployeeId == employeeId)
            .OrderByDescending(i => i.StartedAt)
            .ToListAsync(ct);

    public async Task AddTemplateAsync(OnboardingTemplate template, CancellationToken ct = default) =>
        await db.Templates.AddAsync(template, ct);

    public async Task AddInstanceAsync(OnboardingInstance instance, CancellationToken ct = default) =>
        await db.Instances.AddAsync(instance, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}
