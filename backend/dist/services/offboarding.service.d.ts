export declare class OffboardingService {
    getMyResignation(employeeId: string): Promise<({
        exit_interview: {
            id: string;
            created_at: Date;
            employee_id: string;
            resignation_id: string;
            reason_leaving: string | null;
            job_satisfaction: number | null;
            manager_rating: number | null;
            culture_rating: number | null;
            rehire_eligible: boolean;
            suggestions: string | null;
            conducted_by: string | null;
            conducted_at: Date | null;
        } | null;
        fnf_settlement: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            employee_id: string;
            remarks: string | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            resignation_id: string;
            gratuity: import("@prisma/client/runtime/library").Decimal | null;
            leave_encashment: import("@prisma/client/runtime/library").Decimal | null;
            bonus: import("@prisma/client/runtime/library").Decimal | null;
            net_payable: import("@prisma/client/runtime/library").Decimal | null;
            payment_date: Date | null;
        } | null;
        approvals: ({
            approver: {
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: string;
            status: string | null;
            remarks: string | null;
            approved_at: Date | null;
            approver_id: string;
            resignation_id: string;
        })[];
    } & {
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        reason: string | null;
        submitted_at: Date;
        resignation_date: Date;
        last_working_date: Date | null;
        notice_period_days: number | null;
    }) | null>;
    submitResignation(employeeId: string, data: {
        resignationDate: string;
        reason?: string;
        noticePeriodDays?: number;
    }): Promise<{
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        reason: string | null;
        submitted_at: Date;
        resignation_date: Date;
        last_working_date: Date | null;
        notice_period_days: number | null;
    }>;
    withdrawResignation(employeeId: string): Promise<{
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        reason: string | null;
        submitted_at: Date;
        resignation_date: Date;
        last_working_date: Date | null;
        notice_period_days: number | null;
    }>;
    getPendingResignations(managerId: string): Promise<({
        resignation: {
            employee: {
                department: {
                    id: string;
                    created_at: Date;
                    description: string | null;
                    department_name: string;
                } | null;
                employee_code: string;
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: string;
            updated_at: Date;
            status: string;
            employee_id: string;
            reason: string | null;
            submitted_at: Date;
            resignation_date: Date;
            last_working_date: Date | null;
            notice_period_days: number | null;
        };
    } & {
        id: string;
        status: string | null;
        remarks: string | null;
        approved_at: Date | null;
        approver_id: string;
        resignation_id: string;
    })[]>;
    actionResignation(approvalId: string, managerId: string, status: 'APPROVED' | 'REJECTED', remarks?: string): Promise<{
        success: boolean;
        status: "APPROVED" | "REJECTED";
    }>;
    getExitInterview(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        employee_id: string;
        resignation_id: string;
        reason_leaving: string | null;
        job_satisfaction: number | null;
        manager_rating: number | null;
        culture_rating: number | null;
        rehire_eligible: boolean;
        suggestions: string | null;
        conducted_by: string | null;
        conducted_at: Date | null;
    } | null>;
    submitExitInterview(employeeId: string, data: {
        reasonLeaving?: string;
        jobSatisfaction?: number;
        managerRating?: number;
        cultureRating?: number;
        rehireEligible?: boolean;
        suggestions?: string;
        conductedBy?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        employee_id: string;
        resignation_id: string;
        reason_leaving: string | null;
        job_satisfaction: number | null;
        manager_rating: number | null;
        culture_rating: number | null;
        rehire_eligible: boolean;
        suggestions: string | null;
        conducted_by: string | null;
        conducted_at: Date | null;
    }>;
    getFnFSettlement(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        remarks: string | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        resignation_id: string;
        gratuity: import("@prisma/client/runtime/library").Decimal | null;
        leave_encashment: import("@prisma/client/runtime/library").Decimal | null;
        bonus: import("@prisma/client/runtime/library").Decimal | null;
        net_payable: import("@prisma/client/runtime/library").Decimal | null;
        payment_date: Date | null;
    } | null>;
    upsertFnFSettlement(employeeId: string, data: {
        gratuity?: number;
        leaveEncashment?: number;
        bonus?: number;
        deductions?: number;
        netPayable?: number;
        paymentDate?: string;
        status?: string;
        remarks?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        remarks: string | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        resignation_id: string;
        gratuity: import("@prisma/client/runtime/library").Decimal | null;
        leave_encashment: import("@prisma/client/runtime/library").Decimal | null;
        bonus: import("@prisma/client/runtime/library").Decimal | null;
        net_payable: import("@prisma/client/runtime/library").Decimal | null;
        payment_date: Date | null;
    }>;
    getMyOffboardingChecklist(employeeId: string): Promise<({
        task: {
            id: string;
            created_at: Date;
            description: string | null;
            category: string;
            is_mandatory: boolean;
            task_title: string;
        };
    } & {
        id: string;
        status: string;
        employee_id: string;
        remarks: string | null;
        completed_at: Date | null;
        task_id: string;
    })[]>;
    bootstrapOffboardingChecklist(employeeId: string): Promise<({
        task: {
            id: string;
            created_at: Date;
            description: string | null;
            category: string;
            is_mandatory: boolean;
            task_title: string;
        };
    } & {
        id: string;
        status: string;
        employee_id: string;
        remarks: string | null;
        completed_at: Date | null;
        task_id: string;
    })[]>;
    updateOffboardingItem(id: string, employeeId: string, data: {
        status: string;
        remarks?: string;
    }): Promise<{
        id: string;
        status: string;
        employee_id: string;
        remarks: string | null;
        completed_at: Date | null;
        task_id: string;
    }>;
}
declare const _default: OffboardingService;
export default _default;
//# sourceMappingURL=offboarding.service.d.ts.map