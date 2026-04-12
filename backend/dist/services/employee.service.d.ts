export declare class EmployeeService {
    getAllEmployees(page?: number, limit?: number): Promise<{
        employees: ({
            user: {
                role: {
                    id: string;
                    created_at: Date;
                    role_name: string;
                    description: string | null;
                } | null;
                email: string;
                is_active: boolean;
            };
            department: {
                id: string;
                created_at: Date;
                description: string | null;
                department_name: string;
            } | null;
            manager: {
                id: string;
                employee_code: string;
                first_name: string | null;
                last_name: string | null;
            } | null;
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
            phone: string | null;
            whatsapp_no: string | null;
            department_id: string | null;
            manager_id: string | null;
            joining_date: Date | null;
            employment_status: string;
            base_salary: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getEmployeeById(id: string): Promise<{
        user: {
            role: {
                id: string;
                created_at: Date;
                role_name: string;
                description: string | null;
            } | null;
            email: string;
            is_active: boolean;
        };
        department: {
            id: string;
            created_at: Date;
            description: string | null;
            department_name: string;
        } | null;
        manager: {
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        } | null;
        leave_balances: ({
            leave_type: {
                id: string;
                created_at: Date;
                description: string | null;
                leave_name: string;
                max_days: number | null;
                is_paid: boolean;
                carry_forward: boolean;
                created_by: string | null;
            };
        } & {
            id: string;
            updated_at: Date;
            employee_id: string;
            leave_type_id: string;
            total_days: number | null;
            used_days: number;
            remaining_days: number | null;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        whatsapp_no: string | null;
        department_id: string | null;
        manager_id: string | null;
        joining_date: Date | null;
        employment_status: string;
        base_salary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getMyProfile(userId: string): Promise<{
        user: {
            role: {
                id: string;
                created_at: Date;
                role_name: string;
                description: string | null;
            } | null;
            email: string;
        };
        department: {
            id: string;
            created_at: Date;
            description: string | null;
            department_name: string;
        } | null;
        manager: {
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        } | null;
        leave_balances: ({
            leave_type: {
                id: string;
                created_at: Date;
                description: string | null;
                leave_name: string;
                max_days: number | null;
                is_paid: boolean;
                carry_forward: boolean;
                created_by: string | null;
            };
        } & {
            id: string;
            updated_at: Date;
            employee_id: string;
            leave_type_id: string;
            total_days: number | null;
            used_days: number;
            remaining_days: number | null;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        whatsapp_no: string | null;
        department_id: string | null;
        manager_id: string | null;
        joining_date: Date | null;
        employment_status: string;
        base_salary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    createEmployee(data: {
        email: string;
        password: string;
        roleId: string;
        firstName: string;
        lastName: string;
        phone?: string;
        whatsappNo?: string;
        departmentId?: string;
        managerId?: string;
        joiningDate?: string;
        baseSalary?: number;
        employeeCode: string;
        salaryStructure?: {
            basicPct?: number;
            hraPct?: number;
            daPct?: number;
            specialAllowancePct?: number;
            otherAllowance?: number;
            pfEmployeePct?: number;
            esiApplicable?: boolean;
            professionalTax?: number;
            tdsMonthly?: number;
        };
    }): Promise<{
        user: {
            role: {
                id: string;
                created_at: Date;
                role_name: string;
                description: string | null;
            } | null;
            email: string;
        };
        department: {
            id: string;
            created_at: Date;
            description: string | null;
            department_name: string;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        whatsapp_no: string | null;
        department_id: string | null;
        manager_id: string | null;
        joining_date: Date | null;
        employment_status: string;
        base_salary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateSalaryStructure(employeeId: string, data: {
        basicPct?: number;
        hraPct?: number;
        daPct?: number;
        specialAllowancePct?: number;
        otherAllowance?: number;
        pfEmployeePct?: number;
        esiApplicable?: boolean;
        professionalTax?: number;
        tdsMonthly?: number;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        basic_pct: import("@prisma/client/runtime/library").Decimal;
        hra_pct: import("@prisma/client/runtime/library").Decimal;
        da_pct: import("@prisma/client/runtime/library").Decimal;
        special_allowance_pct: import("@prisma/client/runtime/library").Decimal;
        other_allowance: import("@prisma/client/runtime/library").Decimal;
        pf_employee_pct: import("@prisma/client/runtime/library").Decimal;
        esi_applicable: boolean;
        professional_tax: import("@prisma/client/runtime/library").Decimal;
        tds_monthly: import("@prisma/client/runtime/library").Decimal;
        employee_id: string;
    }>;
    updateEmployee(id: string, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        departmentId?: string;
        managerId?: string;
        employmentStatus?: string;
        baseSalary?: number;
    }): Promise<{
        user: {
            role: {
                id: string;
                created_at: Date;
                role_name: string;
                description: string | null;
            } | null;
            email: string;
        };
        department: {
            id: string;
            created_at: Date;
            description: string | null;
            department_name: string;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        whatsapp_no: string | null;
        department_id: string | null;
        manager_id: string | null;
        joining_date: Date | null;
        employment_status: string;
        base_salary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getTeamMembers(managerId: string): Promise<({
        user: {
            role: {
                id: string;
                created_at: Date;
                role_name: string;
                description: string | null;
            } | null;
            email: string;
        };
        department: {
            id: string;
            created_at: Date;
            description: string | null;
            department_name: string;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        whatsapp_no: string | null;
        department_id: string | null;
        manager_id: string | null;
        joining_date: Date | null;
        employment_status: string;
        base_salary: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getDashboardStats(employeeId: string): Promise<{
        attendanceCount: number;
        pendingLeave: number;
        leaveBalances: ({
            leave_type: {
                id: string;
                created_at: Date;
                description: string | null;
                leave_name: string;
                max_days: number | null;
                is_paid: boolean;
                carry_forward: boolean;
                created_by: string | null;
            };
        } & {
            id: string;
            updated_at: Date;
            employee_id: string;
            leave_type_id: string;
            total_days: number | null;
            used_days: number;
            remaining_days: number | null;
        })[];
        todayAttendance: {
            id: string;
            created_at: Date;
            status: string | null;
            employee_id: string;
            attendance_date: Date;
            clock_in: Date | null;
            clock_out: Date | null;
        } | null;
    }>;
}
declare const _default: EmployeeService;
export default _default;
//# sourceMappingURL=employee.service.d.ts.map