using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.IAM.Domain;

public sealed class Role : AggregateRoot<Guid>
{
    private Role() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsSystem { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private readonly List<RolePermission> _permissions = [];
    public IReadOnlyCollection<RolePermission> Permissions => _permissions.AsReadOnly();

    public static readonly string[] SystemRoles = ["HR_ADMIN", "MANAGER", "EMPLOYEE", "PAYROLL_ADMIN", "LMS_ADMIN"];

    public static Role CreateSystem(Guid tenantId, string name) => new()
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Name = name,
        IsSystem = true,
        CreatedAt = DateTime.UtcNow
    };

    public static Role Create(Guid tenantId, string name, string? description = null) => new()
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Name = name,
        Description = description,
        IsSystem = false,
        CreatedAt = DateTime.UtcNow
    };

    public void AddPermission(string resource, string action, string scope = "all")
    {
        if (_permissions.Any(p => p.Resource == resource && p.Action == action && p.Scope == scope)) return;
        _permissions.Add(new RolePermission(Id, resource, action, scope));
    }

    public void RemovePermission(string resource, string action) =>
        _permissions.RemoveAll(p => p.Resource == resource && p.Action == action);
}

public sealed record RolePermission(Guid RoleId, string Resource, string Action, string Scope = "all");
