namespace HRMSPlatform.Modules.Audit.Domain;

/// <summary>
/// Immutable audit event. Application role has INSERT-only privilege.
/// No UPDATE or DELETE ever applied to this table.
/// Tamper detection via hash chaining.
/// </summary>
public sealed class AuditEvent
{
    public long Id { get; init; }
    public Guid TenantId { get; init; }
    public Guid? ActorId { get; init; }
    public string ActorType { get; init; } = "user";   // user | system | service
    public string Action { get; init; } = string.Empty;
    public string ResourceType { get; init; } = string.Empty;
    public Guid? ResourceId { get; init; }
    public string? OldValue { get; init; }   // JSON (encrypted for PII)
    public string? NewValue { get; init; }   // JSON (encrypted for PII)
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public string? Hash { get; init; }       // SHA256 of (prev_hash + id + action + new_value)
}
