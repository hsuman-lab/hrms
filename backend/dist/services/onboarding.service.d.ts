export declare class OnboardingService {
    getMasterTasks(): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        category: string;
        is_mandatory: boolean;
        task_title: string;
        due_days: number | null;
    }[]>;
    createMasterTask(data: {
        taskTitle: string;
        description?: string;
        category?: string;
        isMandatory?: boolean;
        dueDays?: number;
    }): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        category: string;
        is_mandatory: boolean;
        task_title: string;
        due_days: number | null;
    }>;
    getMyChecklist(employeeId: string): Promise<({
        task: {
            id: string;
            created_at: Date;
            description: string | null;
            category: string;
            is_mandatory: boolean;
            task_title: string;
            due_days: number | null;
        };
    } & {
        id: string;
        status: string;
        employee_id: string;
        remarks: string | null;
        completed_at: Date | null;
        task_id: string;
    })[]>;
    /** HR/Admin: bootstrap checklist for new employee from all master tasks */
    bootstrapChecklist(employeeId: string): Promise<({
        task: {
            id: string;
            created_at: Date;
            description: string | null;
            category: string;
            is_mandatory: boolean;
            task_title: string;
            due_days: number | null;
        };
    } & {
        id: string;
        status: string;
        employee_id: string;
        remarks: string | null;
        completed_at: Date | null;
        task_id: string;
    })[]>;
    updateChecklistItem(id: string, employeeId: string, data: {
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
    getPolicies(employeeId: string): Promise<{
        id: string;
        employee_id: string;
        policy_name: string;
        policy_version: string;
        acknowledged_at: Date;
        ip_address: string | null;
    }[]>;
    acknowledgePolicy(employeeId: string, data: {
        policyName: string;
        policyVersion?: string;
        ipAddress?: string;
    }): Promise<{
        id: string;
        employee_id: string;
        policy_name: string;
        policy_version: string;
        acknowledged_at: Date;
        ip_address: string | null;
    }>;
    getExperience(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        employee_id: string;
        submitted_at: Date | null;
        overall_rating: number | null;
        buddy_rating: number | null;
        process_rating: number | null;
        feedback: string | null;
    } | null>;
    submitExperience(employeeId: string, data: {
        overallRating?: number;
        buddyRating?: number;
        processRating?: number;
        feedback?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        employee_id: string;
        submitted_at: Date | null;
        overall_rating: number | null;
        buddy_rating: number | null;
        process_rating: number | null;
        feedback: string | null;
    }>;
}
declare const _default: OnboardingService;
export default _default;
//# sourceMappingURL=onboarding.service.d.ts.map