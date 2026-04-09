using System.Text.Json;
using HRMSPlatform.Modules.Payroll.Domain;

namespace HRMSPlatform.Modules.Payroll.Application.FormulaEngine;

/// <summary>
/// Evaluates salary component formulas in topological (dependency) order.
/// Supports: fixed values, percentage expressions, slab lookups, cross-references.
/// Produces a computation_log for full audit traceability.
/// </summary>
public sealed class PayrollFormulaEngine
{
    private static readonly Dictionary<string, decimal> _pfSlabs = new()
    {
        ["cap"] = 15000m   // PF computed on min(BASIC, 15000)
    };

    private static readonly Dictionary<string, (decimal From, decimal To, decimal Rate)[]> _ptSlabs = new()
    {
        // Professional Tax — Maharashtra slabs (example)
        ["MH"] = [
            (0, 7500, 0),
            (7501, 10000, 175),
            (10001, decimal.MaxValue, 200)
        ]
    };

    public ComputationResult Compute(
        IReadOnlyList<SalaryComponent> components,
        PayrollContext context)
    {
        var sorted = TopologicalSort(components);
        var values = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
        var log = new List<ComputationStep>();

        // Seed input values
        values["CTC"] = context.AnnualCTC / 12;
        values["LOP_DAYS"] = context.LopDays;
        values["WORKING_DAYS"] = context.WorkingDays;
        values["OT_HOURS"] = context.OvertimeHours;

        foreach (var comp in sorted)
        {
            var value = EvaluateFormula(comp.Formula, comp.Code, values, context);
            values[comp.Code] = Math.Round(value, 2);
            log.Add(new ComputationStep(comp.Code, comp.Name, comp.Formula, value, comp.Type));
        }

        // LOP deduction
        var gross = values.Where(v => GetComponent(components, v.Key)?.Type == "earning")
                         .Sum(v => v.Value);
        var lopDeduct = gross > 0 && context.WorkingDays > 0
            ? Math.Round((gross / context.WorkingDays) * context.LopDays, 2)
            : 0;
        values["LOP_DEDUCT"] = lopDeduct;
        log.Add(new ComputationStep("LOP_DEDUCT", "Loss of Pay", $"(GROSS/{context.WorkingDays})*{context.LopDays}", lopDeduct, "deduction"));

        var totalEarnings = values.Where(v => GetComponent(components, v.Key)?.Type == "earning").Sum(v => v.Value);
        var totalDeductions = values.Where(v => GetComponent(components, v.Key)?.Type is "deduction" or "statutory")
                                    .Sum(v => v.Value) + lopDeduct;
        var net = Math.Round(totalEarnings - totalDeductions + context.Reimbursements, 2);

        return new ComputationResult(
            Gross: totalEarnings,
            Net: net,
            LopAmount: lopDeduct,
            Earnings: values.Where(v => GetComponent(components, v.Key)?.Type == "earning")
                           .ToDictionary(v => v.Key, v => v.Value),
            Deductions: values.Where(v => GetComponent(components, v.Key)?.Type is "deduction" or "statutory")
                              .ToDictionary(v => v.Key, v => v.Value),
            ComputationLog: log);
    }

    private decimal EvaluateFormula(
        string formula, string componentCode,
        Dictionary<string, decimal> values, PayrollContext context)
    {
        formula = formula.Trim();

        // Fixed value: "50000" or "fixed:50000"
        if (formula.StartsWith("fixed:", StringComparison.OrdinalIgnoreCase))
        {
            var fixedPart = formula["fixed:".Length..];
            return decimal.TryParse(fixedPart, out var fixedVal) ? fixedVal : 0;
        }

        // Direct numeric
        if (decimal.TryParse(formula, out var numVal)) return numVal;

        // Percentage: "BASIC * 0.40" or "0.12 * min(BASIC, 15000)"
        if (formula.Contains("min(", StringComparison.OrdinalIgnoreCase))
        {
            return EvaluateMinExpression(formula, values);
        }

        // Simple multiplication: "BASIC * 0.40"
        if (formula.Contains('*'))
        {
            var parts = formula.Split('*');
            if (parts.Length == 2)
            {
                var left = ResolveValue(parts[0].Trim(), values);
                var right = ResolveValue(parts[1].Trim(), values);
                return left * right;
            }
        }

        // Slab lookup: "slab:MH_PT" for professional tax
        if (formula.StartsWith("slab:", StringComparison.OrdinalIgnoreCase))
        {
            var slabKey = formula["slab:".Length..];
            return ComputeSlabValue(slabKey, values, context);
        }

        // Variable reference: "BASIC"
        return values.TryGetValue(formula, out var refVal) ? refVal : 0;
    }

    private decimal EvaluateMinExpression(string formula, Dictionary<string, decimal> values)
    {
        // Pattern: "factor * min(A, B)"
        var minStart = formula.IndexOf("min(", StringComparison.OrdinalIgnoreCase);
        var minEnd = formula.IndexOf(')', minStart);
        var minContent = formula[(minStart + 4)..minEnd];
        var minArgs = minContent.Split(',');
        var a = ResolveValue(minArgs[0].Trim(), values);
        var b = ResolveValue(minArgs[1].Trim(), values);
        var minVal = Math.Min(a, b);

        if (minStart == 0) return minVal;

        var factorStr = formula[..formula.IndexOf('*')].Trim();
        var factor = ResolveValue(factorStr, values);
        return factor * minVal;
    }

    private decimal ComputeSlabValue(string slabKey, Dictionary<string, decimal> values, PayrollContext context)
    {
        if (slabKey.EndsWith("_PT") && _ptSlabs.TryGetValue(slabKey[..^3], out var ptSlabs))
        {
            var gross = values.TryGetValue("GROSS", out var g) ? g : 0;
            return ptSlabs.Where(s => gross >= s.From && gross <= s.To)
                          .Select(s => s.Rate).FirstOrDefault();
        }
        return 0;
    }

    private static decimal ResolveValue(string token, Dictionary<string, decimal> values)
    {
        if (decimal.TryParse(token, out var num)) return num;
        return values.TryGetValue(token, out var v) ? v : 0;
    }

    private static SalaryComponent? GetComponent(IReadOnlyList<SalaryComponent> components, string code) =>
        components.FirstOrDefault(c => c.Code.Equals(code, StringComparison.OrdinalIgnoreCase));

    private static List<SalaryComponent> TopologicalSort(IReadOnlyList<SalaryComponent> components)
    {
        // Kahn's algorithm — sort components by dependency order
        var inDegree = components.ToDictionary(c => c.Code, _ => 0);
        var adj = new Dictionary<string, List<string>>();

        foreach (var comp in components)
        {
            adj[comp.Code] = [];
            foreach (var dep in comp.DependsOn ?? [])
            {
                if (inDegree.ContainsKey(comp.Code))
                    inDegree[comp.Code]++;
                if (!adj.ContainsKey(dep)) adj[dep] = [];
                adj[dep].Add(comp.Code);
            }
        }

        var queue = new Queue<string>(inDegree.Where(x => x.Value == 0).Select(x => x.Key));
        var result = new List<SalaryComponent>();

        while (queue.Count > 0)
        {
            var code = queue.Dequeue();
            var comp = components.FirstOrDefault(c => c.Code == code);
            if (comp is not null) result.Add(comp);

            foreach (var neighbor in adj.GetValueOrDefault(code, []))
            {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) queue.Enqueue(neighbor);
            }
        }

        // Append any remaining (no deps defined) in display order
        foreach (var comp in components.Where(c => !result.Contains(c)))
            result.Add(comp);

        return result;
    }
}

public sealed record PayrollContext(
    Guid EmployeeId,
    decimal AnnualCTC,
    decimal LopDays,
    decimal WorkingDays,
    decimal OvertimeHours,
    decimal Reimbursements,
    string State,
    string Regime = "new",  // old/new (India income tax regime)
    decimal TaxDeclared80C = 0,
    decimal TaxDeclaredHRA = 0);

public sealed record ComputationResult(
    decimal Gross,
    decimal Net,
    decimal LopAmount,
    Dictionary<string, decimal> Earnings,
    Dictionary<string, decimal> Deductions,
    List<ComputationStep> ComputationLog);

public sealed record ComputationStep(
    string Code, string Name, string Formula, decimal Value, string Type);
