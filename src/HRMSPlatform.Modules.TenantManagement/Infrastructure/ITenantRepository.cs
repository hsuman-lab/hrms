using HRMSPlatform.Modules.TenantManagement.Domain;

namespace HRMSPlatform.Modules.TenantManagement.Infrastructure;

public interface ITenantRepository
{
    Task<Tenant?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Tenant?> FindBySlugAsync(string slug, CancellationToken ct = default);
    Task AddAsync(Tenant tenant, CancellationToken ct = default);
    Task UpdateAsync(Tenant tenant, CancellationToken ct = default);
}

public interface IUnitOfWorkTenant
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
