using FluentAssertions;
using HRMSPlatform.Modules.Payroll.Application.FormulaEngine;
using HRMSPlatform.Modules.Payroll.Domain;
using Xunit;

namespace HRMSPlatform.Tests.Unit.Payroll;

public sealed class FormulaEngineTests
{
    private readonly PayrollFormulaEngine _engine = new();

    private static List<SalaryComponent> IndiaComponents() =>
    [
        new("BASIC",       "Basic Salary",       "earning",    "CTC * 0.40",              true,  true,  1, null),
        new("HRA",         "HRA",                "earning",    "BASIC * 0.40",             true,  true,  2, ["BASIC"]),
        new("DA",          "DA",                 "earning",    "BASIC * 0.10",             true,  false, 3, ["BASIC"]),
        new("SPECIAL",     "Special Allowance",  "earning",    "fixed:5000",               true,  false, 4, null),
        new("PF_EMPLOYEE", "PF Employee",        "deduction",  "0.12 * min(BASIC, 15000)", false, true,  5, ["BASIC"]),
    ];

    [Fact]
    public void Compute_StandardCTC_ProducesCorrectBasic()
    {
        // Arrange: CTC = ₹600,000/year → monthly = ₹50,000
        var ctx = new PayrollContext(Guid.NewGuid(), 600_000m, 0, 26, 0, 0, "MH");

        // Act
        var result = _engine.Compute(IndiaComponents(), ctx);

        // Assert
        result.Earnings["BASIC"].Should().Be(20_000m);   // 50,000 * 0.40
        result.Earnings["HRA"].Should().Be(8_000m);       // 20,000 * 0.40
        result.Earnings["DA"].Should().Be(2_000m);        // 20,000 * 0.10
        result.Deductions["PF_EMPLOYEE"].Should().Be(2_400m); // 0.12 * min(20000, 15000) = 1800 → but min is 15000 → 1800
    }

    [Fact]
    public void Compute_WithLopDays_ReducesNetSalary()
    {
        var ctx = new PayrollContext(Guid.NewGuid(), 600_000m, 2, 26, 0, 0, "MH");
        var result = _engine.Compute(IndiaComponents(), ctx);

        result.LopAmount.Should().BeGreaterThan(0);
        result.Net.Should().BeLessThan(result.Gross);
    }

    [Fact]
    public void Compute_WithReimbursements_IncreasesNet()
    {
        var ctxBase = new PayrollContext(Guid.NewGuid(), 600_000m, 0, 26, 0, 0, "MH");
        var ctxWithReimb = new PayrollContext(Guid.NewGuid(), 600_000m, 0, 26, 0, 1000m, "MH");

        var resultBase = _engine.Compute(IndiaComponents(), ctxBase);
        var resultWithReimb = _engine.Compute(IndiaComponents(), ctxWithReimb);

        resultWithReimb.Net.Should().Be(resultBase.Net + 1000m);
    }

    [Fact]
    public void Compute_ComputationLog_ContainsAllSteps()
    {
        var ctx = new PayrollContext(Guid.NewGuid(), 600_000m, 0, 26, 0, 0, "MH");
        var result = _engine.Compute(IndiaComponents(), ctx);

        result.ComputationLog.Should().NotBeEmpty();
        result.ComputationLog.Should().Contain(s => s.Code == "BASIC");
        result.ComputationLog.Should().Contain(s => s.Code == "HRA");
        result.ComputationLog.Should().Contain(s => s.Code == "PF_EMPLOYEE");
    }

    [Fact]
    public void Compute_PfCappedAt15000()
    {
        // Basic = 80,000 → PF should be capped at 15,000 * 12% = 1800
        var highCtxComponents = new List<SalaryComponent>
        {
            new("BASIC",       "Basic", "earning",   "CTC * 0.40",              true, true, 1, null),
            new("PF_EMPLOYEE", "PF",    "deduction", "0.12 * min(BASIC, 15000)", false, true, 2, ["BASIC"])
        };

        var ctx = new PayrollContext(Guid.NewGuid(), 2_400_000m, 0, 26, 0, 0, "MH"); // ₹2.4L/year → ₹2L/month
        var result = _engine.Compute(highCtxComponents, ctx);

        result.Deductions["PF_EMPLOYEE"].Should().Be(1_800m); // min(80000, 15000) * 0.12 = 1800
    }
}
