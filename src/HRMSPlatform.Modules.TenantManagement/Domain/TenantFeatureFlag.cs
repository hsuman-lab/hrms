namespace HRMSPlatform.Modules.TenantManagement.Domain;

public sealed class TenantFeatureFlag
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public string FlagKey { get; init; } = string.Empty;
    public bool Enabled { get; set; }
    public string? Config { get; set; }   // JSON config blob
}
