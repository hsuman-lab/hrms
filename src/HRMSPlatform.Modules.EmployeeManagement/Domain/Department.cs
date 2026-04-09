using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.EmployeeManagement.Domain;

public sealed class Department : AggregateRoot<Guid>
{
    private Department() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Guid? ParentId { get; private set; }
    public Guid? HeadEmployeeId { get; private set; }
    public string? CostCenter { get; private set; }
    public bool IsActive { get; private set; } = true;

    public static Department Create(Guid tenantId, string name, Guid? parentId = null, string? costCenter = null) =>
        new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = name, ParentId = parentId, CostCenter = costCenter };

    public void SetHead(Guid employeeId) => HeadEmployeeId = employeeId;
    public void Rename(string name) => Name = name;
    public void Deactivate() => IsActive = false;
}

public sealed class Position : AggregateRoot<Guid>
{
    private Position() { }

    public Guid TenantId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Band { get; private set; }
    public string? Grade { get; private set; }
    public bool IsOpen { get; private set; }

    public static Position Create(Guid tenantId, string title, string? band = null, string? grade = null) =>
        new() { Id = Guid.NewGuid(), TenantId = tenantId, Title = title, Band = band, Grade = grade, IsOpen = true };
}

public sealed class EmployeeCompensation
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid EmployeeId { get; init; }
    public Guid TenantId { get; init; }
    public DateOnly EffectiveFrom { get; init; }
    public DateOnly? EffectiveTo { get; set; }
    public string Currency { get; init; } = "INR";
    public decimal BaseSalary { get; init; }        // encrypted
    public string PayFrequency { get; init; } = "Monthly";
    public string? Components { get; init; }         // JSON: {BASIC, HRA, DA, SPECIAL}
    public bool IsCurrent { get; set; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
