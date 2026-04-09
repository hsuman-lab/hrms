namespace HRMSPlatform.SharedKernel.MultiTenancy;

public interface ITenantContext
{
    Guid TenantId { get; }
    string TenantSlug { get; }
    string DbSchema { get; }
    bool IsResolved { get; }
    void SetTenant(Guid tenantId, string slug, string schema);
}
