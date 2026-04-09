namespace HRMSPlatform.Modules.Payroll.Application.Compliance;

/// <summary>
/// Country-specific compliance plug-in model.
/// New country = new class implementing this interface, zero code changes to core engine.
/// </summary>
public interface ICompliancePlugin
{
    string CountryCode { get; }
    bool IsApplicable(ComplianceContext ctx);
    Dictionary<string, decimal> ComputeStatutoryDeductions(ComplianceContext ctx);
    IReadOnlyList<ComplianceFilingData> GenerateFilings(ComplianceRunData runData);
}

public sealed record ComplianceContext(
    Guid EmployeeId,
    decimal BasicSalary,
    decimal GrossSalary,
    string State,           // for professional tax
    bool IsEsiEligible,     // GROSS <= ₹21,000/month
    string Regime);

public sealed record ComplianceFilingData(
    string FilingType,      // PF_CHALLAN, ESI_CHALLAN, TDS_24Q
    string Period,
    object Data);

public sealed record ComplianceRunData(
    string Period,
    IReadOnlyList<(Guid EmployeeId, decimal Basic, decimal Gross)> Employees);
