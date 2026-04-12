export declare class LeaveService {
    applyLeave(employeeId: string, data: {
        leaveTypeId: string;
        startDate: string;
        endDate: string;
        reason?: string;
    }): Promise<{
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
        status: string;
        employee_id: string;
        leave_type_id: string;
        total_days: number | null;
        start_date: Date;
        end_date: Date;
        reason: string | null;
        applied_at: Date;
    }>;
    getMyLeaves(employeeId: string, status?: string): Promise<({
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
            leave_request_id: string;
            approver_id: string;
        })[];
    } & {
        id: string;
        status: string;
        employee_id: string;
        leave_type_id: string;
        total_days: number | null;
        start_date: Date;
        end_date: Date;
        reason: string | null;
        applied_at: Date;
    })[]>;
    getLeaveBalance(employeeId: string): Promise<({
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
    })[]>;
    getPendingApprovalsForManager(managerId: string): Promise<({
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
        status: string;
        employee_id: string;
        leave_type_id: string;
        total_days: number | null;
        start_date: Date;
        end_date: Date;
        reason: string | null;
        applied_at: Date;
    })[]>;
    approveOrRejectLeave(leaveRequestId: string, approverId: string, status: 'APPROVED' | 'REJECTED', remarks?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllLeaveTypes(): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        leave_name: string;
        max_days: number | null;
        is_paid: boolean;
        carry_forward: boolean;
        created_by: string | null;
    }[]>;
    createLeaveType(data: {
        leaveName: string;
        description?: string;
        maxDays: number;
        isPaid: boolean;
        carryForward: boolean;
        createdBy: string;
    }): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        leave_name: string;
        max_days: number | null;
        is_paid: boolean;
        carry_forward: boolean;
        created_by: string | null;
    }>;
    updateLeaveType(id: string, data: {
        leaveName?: string;
        description?: string;
        maxDays?: number;
        isPaid?: boolean;
        carryForward?: boolean;
    }): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        leave_name: string;
        max_days: number | null;
        is_paid: boolean;
        carry_forward: boolean;
        created_by: string | null;
    }>;
    getAllLeavesForHR(status?: string, month?: number, year?: number): Promise<({
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
            leave_request_id: string;
            approver_id: string;
        })[];
    } & {
        id: string;
        status: string;
        employee_id: string;
        leave_type_id: string;
        total_days: number | null;
        start_date: Date;
        end_date: Date;
        reason: string | null;
        applied_at: Date;
    })[]>;
}
declare const _default: LeaveService;
export default _default;
//# sourceMappingURL=leave.service.d.ts.map