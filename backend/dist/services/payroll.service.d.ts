export declare class PayrollService {
    generatePayroll(month: number, year: number, generatedBy: string): Promise<{
        generated: number;
        month: number;
        year: number;
    }>;
    getMonthlyPayroll(month: number, year: number): Promise<({
        employee: {
            department: {
                department_name: string;
            } | null;
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: string;
        other_allowance: import("@prisma/client/runtime/library").Decimal | null;
        professional_tax: import("@prisma/client/runtime/library").Decimal | null;
        employee_id: string;
        payroll_month: number;
        payroll_year: number;
        total_working_days: number | null;
        present_days: number | null;
        paid_leave_days: number | null;
        unpaid_leave_days: number | null;
        absent_days: number | null;
        salary_amount: import("@prisma/client/runtime/library").Decimal | null;
        basic: import("@prisma/client/runtime/library").Decimal | null;
        hra: import("@prisma/client/runtime/library").Decimal | null;
        da: import("@prisma/client/runtime/library").Decimal | null;
        special_allowance: import("@prisma/client/runtime/library").Decimal | null;
        pf_employee: import("@prisma/client/runtime/library").Decimal | null;
        esi_employee: import("@prisma/client/runtime/library").Decimal | null;
        tds: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        net_salary: import("@prisma/client/runtime/library").Decimal | null;
        generated_at: Date;
    })[]>;
    getEmployeePayroll(employeeId: string): Promise<{
        id: string;
        other_allowance: import("@prisma/client/runtime/library").Decimal | null;
        professional_tax: import("@prisma/client/runtime/library").Decimal | null;
        employee_id: string;
        payroll_month: number;
        payroll_year: number;
        total_working_days: number | null;
        present_days: number | null;
        paid_leave_days: number | null;
        unpaid_leave_days: number | null;
        absent_days: number | null;
        salary_amount: import("@prisma/client/runtime/library").Decimal | null;
        basic: import("@prisma/client/runtime/library").Decimal | null;
        hra: import("@prisma/client/runtime/library").Decimal | null;
        da: import("@prisma/client/runtime/library").Decimal | null;
        special_allowance: import("@prisma/client/runtime/library").Decimal | null;
        pf_employee: import("@prisma/client/runtime/library").Decimal | null;
        esi_employee: import("@prisma/client/runtime/library").Decimal | null;
        tds: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        net_salary: import("@prisma/client/runtime/library").Decimal | null;
        generated_at: Date;
    }[]>;
    exportPayrollCSV(month: number, year: number): Promise<string>;
    getPayrollSummary(year: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PayrollRecordGroupByOutputType, ("payroll_month" | "payroll_year")[]> & {
        _count: {
            id: number;
        };
        _sum: {
            net_salary: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            salary_amount: import("@prisma/client/runtime/library").Decimal | null;
        };
    })[]>;
}
declare const _default: PayrollService;
export default _default;
//# sourceMappingURL=payroll.service.d.ts.map