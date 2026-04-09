using HRMSPlatform.SharedKernel.Domain;

namespace HRMSPlatform.Modules.Payroll.Domain;

/// <summary>
/// Tenant-configurable salary structure with component DAG.
/// Components are evaluated in dependency order using a topological sort.
/// </summary>
public sealed class SalaryStructure : AggregateRoot<Guid>
{
    private SalaryStructure() { }

    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string CountryCode { get; private set; } = "IN";
    public bool IsDefault { get; private set; }
    public string Components { get; private set; } = "{}"; // JSON component definitions

    public static SalaryStructure Create(Guid tenantId, string name, string countryCode, string componentsJson) =>
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            CountryCode = countryCode,
            Components = componentsJson
        };
}

/// <summary>
/// In-memory representation of a salary component formula.
/// Evaluated via FormulaEngine in topological order.
/// </summary>
public sealed record SalaryComponent(
    string Code,            // BASIC, HRA, PF_EMPLOYEE, TDS
    string Name,
    string Type,            // earning, deduction, statutory
    string Formula,         // "BASIC * 0.40" or "fixed" or "slab:PF_SLAB"
    bool IsTaxable,
    bool IsMandatory,
    int DisplayOrder,
    string[]? DependsOn);   // codes this component requires to be computed first
