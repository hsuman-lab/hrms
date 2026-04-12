export declare class OrgService {
    getOrgChart(): Promise<{
        user: {
            role: {
                role_name: string;
            } | null;
            email: string;
        };
        department: {
            id: string;
            department_name: string;
        } | null;
        id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
        manager_id: string | null;
    }[]>;
    getTeamDirectory(page?: number, limit?: number, search?: string, departmentId?: string): Promise<{
        employees: {
            user: {
                role: {
                    role_name: string;
                } | null;
                email: string;
            };
            department: {
                department_name: string;
            } | null;
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
            phone: string | null;
            manager: {
                first_name: string | null;
                last_name: string | null;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getJobPostings(isInternal?: boolean, status?: string): Promise<({
        department: {
            department_name: string;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        department_id: string | null;
        status: string;
        title: string;
        requirements: string | null;
        location: string | null;
        employment_type: string;
        is_internal: boolean;
        posted_by: string | null;
        salary_range: string | null;
        closing_date: Date | null;
    })[]>;
    getJobPostingById(id: string): Promise<{
        department: {
            department_name: string;
        } | null;
        applications: {
            id: string;
            status: string;
            applied_at: Date;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        department_id: string | null;
        status: string;
        title: string;
        requirements: string | null;
        location: string | null;
        employment_type: string;
        is_internal: boolean;
        posted_by: string | null;
        salary_range: string | null;
        closing_date: Date | null;
    }>;
    createJobPosting(postedBy: string, data: {
        title: string;
        departmentId?: string;
        description?: string;
        requirements?: string;
        location?: string;
        employmentType?: string;
        isInternal?: boolean;
        salaryRange?: string;
        closingDate?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        department_id: string | null;
        status: string;
        title: string;
        requirements: string | null;
        location: string | null;
        employment_type: string;
        is_internal: boolean;
        posted_by: string | null;
        salary_range: string | null;
        closing_date: Date | null;
    }>;
    updateJobPosting(id: string, data: {
        status?: string;
        description?: string;
        closingDate?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        department_id: string | null;
        status: string;
        title: string;
        requirements: string | null;
        location: string | null;
        employment_type: string;
        is_internal: boolean;
        posted_by: string | null;
        salary_range: string | null;
        closing_date: Date | null;
    }>;
    applyToJob(employeeId: string, jobPostingId: string, coverNote?: string): Promise<{
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        applied_at: Date;
        job_posting_id: string;
        cover_note: string | null;
    }>;
    getMyApplications(employeeId: string): Promise<({
        job_posting: {
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
            description: string | null;
            department_id: string | null;
            status: string;
            title: string;
            requirements: string | null;
            location: string | null;
            employment_type: string;
            is_internal: boolean;
            posted_by: string | null;
            salary_range: string | null;
            closing_date: Date | null;
        };
    } & {
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        applied_at: Date;
        job_posting_id: string;
        cover_note: string | null;
    })[]>;
    getApplicationsForPosting(jobPostingId: string): Promise<({
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
        updated_at: Date;
        status: string;
        employee_id: string;
        applied_at: Date;
        job_posting_id: string;
        cover_note: string | null;
    })[]>;
    updateApplicationStatus(id: string, status: string): Promise<{
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        applied_at: Date;
        job_posting_id: string;
        cover_note: string | null;
    }>;
}
declare const _default: OrgService;
export default _default;
//# sourceMappingURL=org.service.d.ts.map