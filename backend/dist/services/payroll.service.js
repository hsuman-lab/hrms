"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const database_1 = __importDefault(require("../config/database"));
const csv_1 = require("../utils/csv");
const getWorkingDaysInMonth = (year, month) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6)
            count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
};
/**
 * Compute Indian salary breakdown from gross CTC and SalaryStructure.
 * Returns gross components and statutory deductions.
 */
function computeIndianSalary(grossMonthly, ss) {
    const basic = (grossMonthly * ss.basic_pct) / 100;
    const hra = (grossMonthly * ss.hra_pct) / 100;
    const da = (grossMonthly * ss.da_pct) / 100;
    const special = (grossMonthly * ss.special_allowance_pct) / 100;
    const other = Number(ss.other_allowance);
    // PF: 12% of basic (employee share), capped at ₹1800 (PF wage ceiling ₹15000)
    const pfWage = Math.min(basic, 15000);
    const pf_employee = Math.round((pfWage * Number(ss.pf_employee_pct)) / 100);
    // ESI: 0.75% of gross if gross <= ₹21000/month
    const esi_employee = ss.esi_applicable && grossMonthly <= 21000
        ? Math.round(grossMonthly * 0.0075)
        : 0;
    const professional_tax = Number(ss.professional_tax);
    const tds = Number(ss.tds_monthly);
    return { basic, hra, da, special, other, pf_employee, esi_employee, professional_tax, tds };
}
class PayrollService {
    async generatePayroll(month, year, generatedBy) {
        const totalWorkingDays = getWorkingDaysInMonth(year, month);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const employees = await database_1.default.employee.findMany({
            where: { employment_status: 'ACTIVE' },
            select: { id: true, base_salary: true, salary_structure: true },
        });
        const results = await Promise.all(employees.map(async (emp) => {
            const presentDays = await database_1.default.attendance.count({
                where: {
                    employee_id: emp.id,
                    attendance_date: { gte: startDate, lte: endDate },
                    status: { in: ['PRESENT', 'LATE'] },
                },
            });
            const approvedLeaves = await database_1.default.leaveRequest.findMany({
                where: {
                    employee_id: emp.id,
                    status: 'APPROVED',
                    start_date: { gte: startDate },
                    end_date: { lte: endDate },
                },
                include: { leave_type: true },
            });
            let paidLeaveDays = 0;
            let unpaidLeaveDays = 0;
            for (const leave of approvedLeaves) {
                if (leave.leave_type.is_paid)
                    paidLeaveDays += leave.total_days ?? 0;
                else
                    unpaidLeaveDays += leave.total_days ?? 0;
            }
            const absentDays = Math.max(0, totalWorkingDays - presentDays - paidLeaveDays - unpaidLeaveDays);
            const grossMonthly = Number(emp.base_salary ?? 0);
            // Prorate gross for loss-of-pay days
            const lopDays = unpaidLeaveDays + absentDays;
            const dailyRate = grossMonthly / totalWorkingDays;
            const grossEarned = Math.max(0, grossMonthly - lopDays * dailyRate);
            // Use salary structure if available, else default Indian ratios
            const ss = emp.salary_structure ?? {
                basic_pct: 40, hra_pct: 20, da_pct: 10, special_allowance_pct: 20,
                other_allowance: 0, pf_employee_pct: 12, esi_applicable: false,
                professional_tax: 200, tds_monthly: 0,
            };
            const breakdown = computeIndianSalary(grossEarned, {
                basic_pct: Number(ss.basic_pct),
                hra_pct: Number(ss.hra_pct),
                da_pct: Number(ss.da_pct),
                special_allowance_pct: Number(ss.special_allowance_pct),
                other_allowance: Number(ss.other_allowance),
                pf_employee_pct: Number(ss.pf_employee_pct),
                esi_applicable: Boolean(ss.esi_applicable),
                professional_tax: Number(ss.professional_tax),
                tds_monthly: Number(ss.tds_monthly),
            });
            const totalDeductions = breakdown.pf_employee + breakdown.esi_employee +
                breakdown.professional_tax + breakdown.tds;
            const netSalary = Math.max(0, grossEarned - totalDeductions);
            const payload = {
                total_working_days: totalWorkingDays,
                present_days: presentDays,
                paid_leave_days: paidLeaveDays,
                unpaid_leave_days: unpaidLeaveDays,
                absent_days: absentDays,
                salary_amount: grossEarned,
                basic: breakdown.basic,
                hra: breakdown.hra,
                da: breakdown.da,
                special_allowance: breakdown.special,
                other_allowance: breakdown.other,
                pf_employee: breakdown.pf_employee,
                esi_employee: breakdown.esi_employee,
                professional_tax: breakdown.professional_tax,
                tds: breakdown.tds,
                deductions: totalDeductions,
                net_salary: netSalary,
                generated_at: new Date(),
            };
            return database_1.default.payrollRecord.upsert({
                where: { employee_id_payroll_month_payroll_year: { employee_id: emp.id, payroll_month: month, payroll_year: year } },
                update: payload,
                create: { employee_id: emp.id, payroll_month: month, payroll_year: year, ...payload },
            });
        }));
        return { generated: results.length, month, year };
    }
    async getMonthlyPayroll(month, year) {
        return database_1.default.payrollRecord.findMany({
            where: { payroll_month: month, payroll_year: year },
            include: {
                employee: {
                    select: {
                        id: true, first_name: true, last_name: true, employee_code: true,
                        department: { select: { department_name: true } },
                    },
                },
            },
            orderBy: { employee: { employee_code: 'asc' } },
        });
    }
    async getEmployeePayroll(employeeId) {
        return database_1.default.payrollRecord.findMany({
            where: { employee_id: employeeId },
            orderBy: [{ payroll_year: 'desc' }, { payroll_month: 'desc' }],
        });
    }
    async exportPayrollCSV(month, year) {
        const records = await this.getMonthlyPayroll(month, year);
        const csvData = records.map((r) => ({
            'Employee Code': r.employee.employee_code,
            'First Name': r.employee.first_name ?? '',
            'Last Name': r.employee.last_name ?? '',
            'Department': r.employee.department?.department_name ?? '',
            'Month': r.payroll_month,
            'Year': r.payroll_year,
            'Working Days': r.total_working_days,
            'Present Days': r.present_days,
            'Paid Leave': r.paid_leave_days,
            'Unpaid Leave': r.unpaid_leave_days,
            'Absent Days': r.absent_days,
            'Gross': Number(r.salary_amount ?? 0).toFixed(2),
            'Basic': Number(r.basic ?? 0).toFixed(2),
            'HRA': Number(r.hra ?? 0).toFixed(2),
            'DA': Number(r.da ?? 0).toFixed(2),
            'Special Allow.': Number(r.special_allowance ?? 0).toFixed(2),
            'PF (Employee)': Number(r.pf_employee ?? 0).toFixed(2),
            'ESI (Employee)': Number(r.esi_employee ?? 0).toFixed(2),
            'Professional Tax': Number(r.professional_tax ?? 0).toFixed(2),
            'TDS': Number(r.tds ?? 0).toFixed(2),
            'Total Deductions': Number(r.deductions ?? 0).toFixed(2),
            'Net Salary': Number(r.net_salary ?? 0).toFixed(2),
        }));
        return (0, csv_1.toCSV)(csvData);
    }
    async getPayrollSummary(year) {
        return database_1.default.payrollRecord.groupBy({
            by: ['payroll_month', 'payroll_year'],
            where: { payroll_year: year },
            _sum: { net_salary: true, deductions: true, salary_amount: true },
            _count: { id: true },
            orderBy: { payroll_month: 'asc' },
        });
    }
}
exports.PayrollService = PayrollService;
exports.default = new PayrollService();
//# sourceMappingURL=payroll.service.js.map