namespace HRMSPlatform.Infrastructure.MultiTenancy;

public interface ITenantLookupService
{
    Task<TenantInfo?> GetByIdAsync(Guid tenantId);
    Task<TenantInfo?> GetBySlugAsync(string slug);
    Task<TenantInfo?> GetByDomainAsync(string domain);
}

public record TenantInfo(Guid Id, string Slug, string DbSchema, string Status, string PlanId);
