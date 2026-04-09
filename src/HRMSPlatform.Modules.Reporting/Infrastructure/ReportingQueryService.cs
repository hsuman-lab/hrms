using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.Reporting.Infrastructure;

/// <summary>
/// Read-only query service for analytics reports.
/// In production this reads from the OLAP replica (Redshift/ClickHouse via read-only connection).
/// For MVP it reads from OLTP read replica with materialized views.
/// </summary>
public sealed class ReportingQueryService(ReportingDbContext db)
{
    public async Task<object> GetHeadcountAsync(Guid tenantId, DateTime asOf, CancellationToken ct)
    {
        var result = await db.Database
            .SqlQueryRaw<HeadcountRow>(
                @"SELECT d.name AS department, COUNT(e.id) AS employee_count,
                         SUM(CASE WHEN e.status = 'Active' THEN 1 ELSE 0 END) AS active_count
                  FROM employees e
                  LEFT JOIN departments d ON e.department_id = d.id
                  WHERE e.tenant_id = {0} AND e.hire_date <= {1}
                    AND (e.exit_date IS NULL OR e.exit_date > {1})
                  GROUP BY d.name
                  ORDER BY active_count DESC",
                tenantId, asOf)
            .ToListAsync(ct);
        return result;
    }

    public async Task<object> GetAttritionAsync(Guid tenantId, int year, int? month, CancellationToken ct)
    {
        var monthFilter = month.HasValue ? $"AND EXTRACT(MONTH FROM e.exit_date) = {month}" : "";
        var result = await db.Database
            .SqlQueryRaw<AttritionRow>(
                $@"SELECT EXTRACT(MONTH FROM e.exit_date) AS month,
                          COUNT(*) AS terminations,
                          e.exit_reason
                   FROM employees e
                   WHERE e.tenant_id = {{0}}
                     AND EXTRACT(YEAR FROM e.exit_date) = {{1}}
                     AND e.status = 'Terminated'
                     {monthFilter}
                   GROUP BY month, e.exit_reason
                   ORDER BY month",
                tenantId, year)
            .ToListAsync(ct);
        return result;
    }

    public async Task<object> GetPayrollCostAsync(Guid tenantId, string period, CancellationToken ct)
    {
        var result = await db.Database
            .SqlQueryRaw<PayrollCostRow>(
                @"SELECT d.name AS department, SUM(pe.gross_salary) AS total_gross,
                         SUM(pe.net_salary) AS total_net, COUNT(pe.id) AS employee_count
                  FROM payroll_entries pe
                  JOIN payroll_runs pr ON pe.run_id = pr.id
                  JOIN employees e ON pe.employee_id = e.id
                  LEFT JOIN departments d ON e.department_id = d.id
                  WHERE pe.tenant_id = {0} AND TO_CHAR(pr.period_start, 'YYYY-MM') = {1}
                  GROUP BY d.name
                  ORDER BY total_gross DESC",
                tenantId, period)
            .ToListAsync(ct);
        return result;
    }

    public async Task<object> GetLeaveUtilizationAsync(Guid tenantId, int year, CancellationToken ct)
    {
        var result = await db.Database
            .SqlQueryRaw<LeaveUtilizationRow>(
                @"SELECT lt.name AS leave_type, SUM(lb.used) AS total_used,
                         AVG(lb.used) AS avg_per_employee, COUNT(lb.id) AS employee_count
                  FROM leave_balances lb
                  JOIN leave_types lt ON lb.leave_type_id = lt.id
                  WHERE lb.tenant_id = {0} AND lb.year = {1}
                  GROUP BY lt.name",
                tenantId, year)
            .ToListAsync(ct);
        return result;
    }

    public async Task<object> GetAttendanceSummaryAsync(Guid tenantId, int year, int month, CancellationToken ct)
    {
        var result = await db.Database
            .SqlQueryRaw<AttendanceSummaryRow>(
                @"SELECT e.id AS employee_id, e.first_name || ' ' || e.last_name AS name,
                         COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present_days,
                         COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS absent_days,
                         SUM(a.overtime_minutes) / 60.0 AS total_overtime_hours
                  FROM attendance_records a
                  JOIN employees e ON a.employee_id = e.id
                  WHERE a.tenant_id = {0}
                    AND EXTRACT(YEAR FROM a.date) = {1}
                    AND EXTRACT(MONTH FROM a.date) = {2}
                  GROUP BY e.id, name",
                tenantId, year, month)
            .ToListAsync(ct);
        return result;
    }
}

// Projection types for raw SQL queries
public sealed record HeadcountRow(string Department, int EmployeeCount, int ActiveCount);
public sealed record AttritionRow(int Month, int Terminations, string? ExitReason);
public sealed record PayrollCostRow(string Department, decimal TotalGross, decimal TotalNet, int EmployeeCount);
public sealed record LeaveUtilizationRow(string LeaveType, decimal TotalUsed, decimal AvgPerEmployee, int EmployeeCount);
public sealed record AttendanceSummaryRow(Guid EmployeeId, string Name, int PresentDays, int AbsentDays, double TotalOvertimeHours);
