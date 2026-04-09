using FluentAssertions;
using HRMSPlatform.Modules.Payroll.Application.Compliance;
using Xunit;

namespace HRMSPlatform.Tests.Unit.Payroll;

public sealed class IndiaTaxPluginTests
{
    private readonly IndiaTaxPlugin _plugin = new();

    [Fact]
    public void ComputeStatutoryDeductions_PfBasedOnMin15000()
    {
        var ctx = new ComplianceContext(Guid.NewGuid(), 20_000m, 40_000m, "MH", false, "new");
        var result = _plugin.ComputeStatutoryDeductions(ctx);

        // min(20000, 15000) * 12% = 1800
        result["PF_EMPLOYEE"].Should().Be(1_800m);
        result["PF_EMPLOYER"].Should().Be(1_800m);
    }

    [Fact]
    public void ComputeStatutoryDeductions_EsiApplicableWhenGrossBelow21000()
    {
        var ctx = new ComplianceContext(Guid.NewGuid(), 10_000m, 18_000m, "MH", true, "new");
        var result = _plugin.ComputeStatutoryDeductions(ctx);

        result.Should().ContainKey("ESI_EMPLOYEE");
        result["ESI_EMPLOYEE"].Should().Be(Math.Round(18_000m * 0.0075m, 0));
    }

    [Fact]
    public void ComputeStatutoryDeductions_EsiNotApplicableWhenGrossAbove21000()
    {
        var ctx = new ComplianceContext(Guid.NewGuid(), 15_000m, 35_000m, "MH", false, "new");
        var result = _plugin.ComputeStatutoryDeductions(ctx);

        result.Should().NotContainKey("ESI_EMPLOYEE");
    }

    [Theory]
    [InlineData("MH", 8000,  0)]
    [InlineData("MH", 9000,  175)]
    [InlineData("MH", 15000, 200)]
    [InlineData("KA", 10000, 0)]
    [InlineData("KA", 17000, 150)]
    [InlineData("KA", 25000, 200)]
    public void ProfessionalTax_CorrectSlabForState(string state, decimal gross, decimal expectedPt)
    {
        var ctx = new ComplianceContext(Guid.NewGuid(), gross * 0.4m, gross, state, false, "new");
        var result = _plugin.ComputeStatutoryDeductions(ctx);
        result["PROFESSIONAL_TAX"].Should().Be(expectedPt);
    }

    [Fact]
    public void Tds_ZeroForIncomeBelow7Lakh_NewRegime()
    {
        // Annual gross ₹6 lakh → monthly ₹50,000 → TDS = 0 (rebate u/s 87A)
        var ctx = new ComplianceContext(Guid.NewGuid(), 20_000m, 50_000m, "MH", false, "new");
        var result = _plugin.ComputeStatutoryDeductions(ctx);

        result["TDS"].Should().Be(0); // Annual = 6L ≤ 7L → 0 tax
    }
}
