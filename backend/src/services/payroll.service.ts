import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { toCSV } from '../utils/csv';

const getWorkingDaysInMonth = (year: number, month: number): number => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export class PayrollService {
  async generatePayroll(month: number, year: number, generatedBy: string) {
    const totalWorkingDays = getWorkingDaysInMonth(year, month);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const employees = await prisma.employee.findMany({
      where: { employment_status: 'ACTIVE' },
      select: { id: true, base_salary: true },
    });

    const results = await Promise.all(
      employees.map(async (emp) => {
        const presentDays = await prisma.attendance.count({
          where: {
            employee_id: emp.id,
            attendance_date: { gte: startDate, lte: endDate },
            status: { in: ['PRESENT', 'LATE'] },
          },
        });

        const approvedLeaves = await prisma.leaveRequest.findMany({
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
          if (leave.leave_type.is_paid) paidLeaveDays += leave.total_days ?? 0;
          else unpaidLeaveDays += leave.total_days ?? 0;
        }

        const absentDays = Math.max(0, totalWorkingDays - presentDays - paidLeaveDays - unpaidLeaveDays);
        const salaryAmount = Number(emp.base_salary ?? 0);
        const dailyRate = salaryAmount / totalWorkingDays;
        const deductions = (unpaidLeaveDays + absentDays) * dailyRate;
        const netSalary = Math.max(0, salaryAmount - deductions);

        return prisma.payrollRecord.upsert({
          where: { employee_id_payroll_month_payroll_year: { employee_id: emp.id, payroll_month: month, payroll_year: year } },
          update: {
            total_working_days: totalWorkingDays,
            present_days: presentDays,
            paid_leave_days: paidLeaveDays,
            unpaid_leave_days: unpaidLeaveDays,
            absent_days: absentDays,
            salary_amount: salaryAmount,
            deductions,
            net_salary: netSalary,
            generated_at: new Date(),
          },
          create: {
            employee_id: emp.id,
            payroll_month: month,
            payroll_year: year,
            total_working_days: totalWorkingDays,
            present_days: presentDays,
            paid_leave_days: paidLeaveDays,
            unpaid_leave_days: unpaidLeaveDays,
            absent_days: absentDays,
            salary_amount: salaryAmount,
            deductions,
            net_salary: netSalary,
          },
        });
      })
    );

    return { generated: results.length, month, year };
  }

  async getMonthlyPayroll(month: number, year: number) {
    return prisma.payrollRecord.findMany({
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

  async getEmployeePayroll(employeeId: string) {
    return prisma.payrollRecord.findMany({
      where: { employee_id: employeeId },
      orderBy: [{ payroll_year: 'desc' }, { payroll_month: 'desc' }],
    });
  }

  async exportPayrollCSV(month: number, year: number): Promise<string> {
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
      'Gross Salary': Number(r.salary_amount ?? 0).toFixed(2),
      'Deductions': Number(r.deductions ?? 0).toFixed(2),
      'Net Salary': Number(r.net_salary ?? 0).toFixed(2),
    }));

    return toCSV(csvData as Record<string, unknown>[]);
  }

  async getPayrollSummary(year: number) {
    return prisma.payrollRecord.groupBy({
      by: ['payroll_month', 'payroll_year'],
      where: { payroll_year: year },
      _sum: { net_salary: true, deductions: true, salary_amount: true },
      _count: { id: true },
      orderBy: { payroll_month: 'asc' },
    });
  }
}

export default new PayrollService();
