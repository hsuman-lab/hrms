namespace HRMSPlatform.Modules.Payroll.Application.Compliance;

/// <summary>
/// India statutory compliance: PF, ESI, Professional Tax, TDS.
/// Slab values are data-driven — update in DB for yearly changes.
/// </summary>
public sealed class IndiaTaxPlugin : ICompliancePlugin
{
    public string CountryCode => "IN";
    public bool IsApplicable(ComplianceContext ctx) => true; // applicable to all India employees

    public Dictionary<string, decimal> ComputeStatutoryDeductions(ComplianceContext ctx)
    {
        var deductions = new Dictionary<string, decimal>();

        // ─── PF (Provident Fund) ─────────────────────────────────────────────
        // Employee: 12% of min(BASIC, ₹15,000)
        // Employer: 12% of min(BASIC, ₹15,000)  [added to CTC, not deducted from gross]
        var pfBase = Math.Min(ctx.BasicSalary, 15_000m);
        deductions["PF_EMPLOYEE"] = Math.Round(pfBase * 0.12m, 0);
        deductions["PF_EMPLOYER"] = Math.Round(pfBase * 0.12m, 0);

        // ─── ESI (Employees' State Insurance) ────────────────────────────────
        // Employee: 0.75% of Gross  if GROSS ≤ ₹21,000
        // Employer: 3.25% of Gross
        if (ctx.IsEsiEligible)
        {
            deductions["ESI_EMPLOYEE"] = Math.Round(ctx.GrossSalary * 0.0075m, 0);
            deductions["ESI_EMPLOYER"] = Math.Round(ctx.GrossSalary * 0.0325m, 0);
        }

        // ─── Professional Tax (state-specific) ───────────────────────────────
        deductions["PROFESSIONAL_TAX"] = ComputeProfessionalTax(ctx.State, ctx.GrossSalary);

        // ─── TDS (simplified — actual requires annual projection) ────────────
        // Monthly TDS = Annual tax liability / 12
        deductions["TDS"] = ComputeMonthlyTds(ctx.GrossSalary * 12, ctx.Regime);

        return deductions;
    }

    public IReadOnlyList<ComplianceFilingData> GenerateFilings(ComplianceRunData runData)
    {
        var filings = new List<ComplianceFilingData>();

        // PF Challan
        var pfData = runData.Employees.Select(e => new
        {
            e.EmployeeId,
            EmployeeContribution = Math.Round(Math.Min(e.Basic, 15_000m) * 0.12m, 0),
            EmployerContribution = Math.Round(Math.Min(e.Basic, 15_000m) * 0.12m, 0)
        }).ToList();
        filings.Add(new ComplianceFilingData("PF_CHALLAN", runData.Period, pfData));

        // ESI Challan
        var esiData = runData.Employees
            .Where(e => e.Gross <= 21_000m)
            .Select(e => new
            {
                e.EmployeeId,
                EmployeeContribution = Math.Round(e.Gross * 0.0075m, 0),
                EmployerContribution = Math.Round(e.Gross * 0.0325m, 0)
            }).ToList();
        filings.Add(new ComplianceFilingData("ESI_CHALLAN", runData.Period, esiData));

        return filings;
    }

    private static decimal ComputeProfessionalTax(string state, decimal gross) =>
        state.ToUpperInvariant() switch
        {
            "MH" => gross switch          // Maharashtra
            {
                <= 7500 => 0,
                <= 10000 => 175,
                _ => 200
            },
            "KA" => gross switch          // Karnataka
            {
                <= 15000 => 0,
                <= 20000 => 150,
                _ => 200
            },
            "WB" => gross switch          // West Bengal
            {
                <= 8500 => 0,
                <= 10000 => 90,
                <= 15000 => 110,
                <= 25000 => 130,
                <= 40000 => 150,
                _ => 200
            },
            _ => 0                        // States without PT
        };

    private static decimal ComputeMonthlyTds(decimal annualGross, string regime)
    {
        // Simplified new regime (FY 2024-25)
        var annualTax = regime.ToLowerInvariant() == "new"
            ? ComputeNewRegimeTax(annualGross)
            : ComputeOldRegimeTax(annualGross);

        // Add 4% cess
        annualTax *= 1.04m;
        return Math.Round(annualTax / 12, 0);
    }

    private static decimal ComputeNewRegimeTax(decimal income)
    {
        // New regime slabs (FY 2024-25)
        // Rebate u/s 87A: tax = 0 if income ≤ ₹7 lakh
        if (income <= 700_000) return 0;

        decimal tax = 0;
        if (income > 300_000) tax += Math.Min(income - 300_000, 300_000) * 0.05m;
        if (income > 600_000) tax += Math.Min(income - 600_000, 300_000) * 0.10m;
        if (income > 900_000) tax += Math.Min(income - 900_000, 300_000) * 0.15m;
        if (income > 1_200_000) tax += Math.Min(income - 1_200_000, 300_000) * 0.20m;
        if (income > 1_500_000) tax += (income - 1_500_000) * 0.30m;
        return tax;
    }

    private static decimal ComputeOldRegimeTax(decimal income)
    {
        // Standard deduction ₹50,000
        income = Math.Max(0, income - 50_000);
        decimal tax = 0;
        if (income > 250_000) tax += Math.Min(income - 250_000, 250_000) * 0.05m;
        if (income > 500_000) tax += Math.Min(income - 500_000, 500_000) * 0.20m;
        if (income > 1_000_000) tax += (income - 1_000_000) * 0.30m;
        return tax;
    }
}
