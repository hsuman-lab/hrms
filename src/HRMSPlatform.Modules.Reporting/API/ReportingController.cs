using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSPlatform.Modules.Reporting.API;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public sealed class ReportingController(
    Infrastructure.ReportingQueryService queryService,
    ITenantContext tenant) : ControllerBase
{
    /// <summary>Headcount summary by department.</summary>
    [HttpGet("headcount")]
    public async Task<IActionResult> Headcount([FromQuery] string? asOf, CancellationToken ct)
    {
        var date = string.IsNullOrEmpty(asOf) ? DateTime.UtcNow : DateTime.Parse(asOf);
        var data = await queryService.GetHeadcountAsync(tenant.TenantId, date, ct);
        return Ok(data);
    }

    /// <summary>Attrition report for a period.</summary>
    [HttpGet("attrition")]
    public async Task<IActionResult> Attrition([FromQuery] int year, [FromQuery] int? month, CancellationToken ct)
    {
        var data = await queryService.GetAttritionAsync(tenant.TenantId, year, month, ct);
        return Ok(data);
    }

    /// <summary>Payroll cost summary by department.</summary>
    [HttpGet("payroll-cost")]
    [Authorize(Roles = "HR_ADMIN,PAYROLL_ADMIN")]
    public async Task<IActionResult> PayrollCost([FromQuery] string period, CancellationToken ct)
    {
        var data = await queryService.GetPayrollCostAsync(tenant.TenantId, period, ct);
        return Ok(data);
    }

    /// <summary>Leave utilization by employee / department.</summary>
    [HttpGet("leave-utilization")]
    public async Task<IActionResult> LeaveUtilization([FromQuery] int year, CancellationToken ct)
    {
        var data = await queryService.GetLeaveUtilizationAsync(tenant.TenantId, year, ct);
        return Ok(data);
    }

    /// <summary>Attendance summary for a period.</summary>
    [HttpGet("attendance")]
    public async Task<IActionResult> AttendanceSummary(
        [FromQuery] int year, [FromQuery] int month, CancellationToken ct)
    {
        var data = await queryService.GetAttendanceSummaryAsync(tenant.TenantId, year, month, ct);
        return Ok(data);
    }
}
