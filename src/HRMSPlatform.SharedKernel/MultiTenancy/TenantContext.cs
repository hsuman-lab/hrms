namespace HRMSPlatform.SharedKernel.MultiTenancy;

public sealed class TenantContext : ITenantContext
{
    private Guid _tenantId;
    private string _tenantSlug = string.Empty;
    private string _dbSchema = string.Empty;

    public Guid TenantId => IsResolved ? _tenantId : throw new InvalidOperationException("Tenant not resolved.");
    public string TenantSlug => IsResolved ? _tenantSlug : throw new InvalidOperationException("Tenant not resolved.");
    public string DbSchema => IsResolved ? _dbSchema : throw new InvalidOperationException("Tenant not resolved.");
    public bool IsResolved { get; private set; }

    public void SetTenant(Guid tenantId, string slug, string schema)
    {
        _tenantId = tenantId;
        _tenantSlug = slug;
        _dbSchema = schema;
        IsResolved = true;
    }
}
