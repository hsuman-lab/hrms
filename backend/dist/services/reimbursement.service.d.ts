export declare class ReimbursementService {
    apply(employeeId: string, data: {
        category: string;
        amount: number;
        description: string;
        billDate: string;
    }): Promise<{
        employee: {
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: string;
        description: string;
        status: string;
        employee_id: string;
        category: string;
        applied_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        bill_date: Date;
    }>;
    getMyReimbursements(employeeId: string): Promise<({
        approvals: ({
            approver: {
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: string;
            approval_status: string | null;
            remarks: string | null;
            approved_at: Date | null;
            approver_id: string;
            reimbursement_id: string;
        })[];
    } & {
        id: string;
        description: string;
        status: string;
        employee_id: string;
        category: string;
        applied_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        bill_date: Date;
    })[]>;
    /** Pending reimbursements for direct reports of the manager */
    getPendingForManager(managerId: string): Promise<({
        employee: {
            department: {
                id: string;
                created_at: Date;
                description: string | null;
                department_name: string;
            } | null;
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: string;
        description: string;
        status: string;
        employee_id: string;
        category: string;
        applied_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        bill_date: Date;
    })[]>;
    approveOrReject(reimbursementId: string, approverId: string, status: 'APPROVED' | 'REJECTED', remarks?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /** HR: all reimbursements */
    getAllForHR(status?: string): Promise<({
        employee: {
            department: {
                id: string;
                created_at: Date;
                description: string | null;
                department_name: string;
            } | null;
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
        approvals: ({
            approver: {
                first_name: string | null;
                last_name: string | null;
            };
        } & {
            id: string;
            approval_status: string | null;
            remarks: string | null;
            approved_at: Date | null;
            approver_id: string;
            reimbursement_id: string;
        })[];
    } & {
        id: string;
        description: string;
        status: string;
        employee_id: string;
        category: string;
        applied_at: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        bill_date: Date;
    })[]>;
}
declare const _default: ReimbursementService;
export default _default;
//# sourceMappingURL=reimbursement.service.d.ts.map