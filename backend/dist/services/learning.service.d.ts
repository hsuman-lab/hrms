export declare class LearningService {
    getAllCourses(): Promise<({
        _count: {
            enrollments: number;
        };
        creator: {
            employee: {
                first_name: string | null;
                last_name: string | null;
            } | null;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        created_by: string | null;
        title: string;
        category: string;
        is_mandatory: boolean;
        duration_mins: number | null;
    })[]>;
    createCourse(data: {
        title: string;
        description?: string;
        category?: string;
        is_mandatory?: boolean;
        duration_mins?: number;
        createdBy: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        created_by: string | null;
        title: string;
        category: string;
        is_mandatory: boolean;
        duration_mins: number | null;
    }>;
    updateCourse(id: string, data: {
        title?: string;
        description?: string;
        category?: string;
        is_mandatory?: boolean;
        duration_mins?: number;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        created_by: string | null;
        title: string;
        category: string;
        is_mandatory: boolean;
        duration_mins: number | null;
    }>;
    deleteCourse(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        created_by: string | null;
        title: string;
        category: string;
        is_mandatory: boolean;
        duration_mins: number | null;
    }>;
    /** Enroll one or more employees in a course (idempotent). */
    enrollEmployees(courseId: string, employeeIds: string[], dueDate?: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /** Enroll ALL active employees in a course. */
    enrollAll(courseId: string, dueDate?: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /** Employee updates their own progress. */
    updateProgress(courseId: string, employeeId: string, progressPct: number): Promise<{
        course: {
            id: string;
            created_at: Date;
            updated_at: Date;
            description: string | null;
            created_by: string | null;
            title: string;
            category: string;
            is_mandatory: boolean;
            duration_mins: number | null;
        };
    } & {
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        course_id: string;
        progress_pct: number;
        completed_at: Date | null;
        due_date: Date | null;
        assigned_at: Date;
    }>;
    /** Get all enrollments for an employee. */
    getMyEnrollments(employeeId: string): Promise<({
        course: {
            id: string;
            created_at: Date;
            updated_at: Date;
            description: string | null;
            created_by: string | null;
            title: string;
            category: string;
            is_mandatory: boolean;
            duration_mins: number | null;
        };
    } & {
        id: string;
        updated_at: Date;
        status: string;
        employee_id: string;
        course_id: string;
        progress_pct: number;
        completed_at: Date | null;
        due_date: Date | null;
        assigned_at: Date;
    })[]>;
    /** HR: get all enrollments across all employees for a course. */
    getCourseEnrollments(courseId: string): Promise<({
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
        updated_at: Date;
        status: string;
        employee_id: string;
        course_id: string;
        progress_pct: number;
        completed_at: Date | null;
        due_date: Date | null;
        assigned_at: Date;
    })[]>;
    /** HR: overall L&D stats. */
    getLearningStats(): Promise<{
        totalCourses: number;
        mandatoryCourses: number;
        totalEnrollments: number;
        completed: number;
        overdue: number;
    }>;
    getMyCertificates(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        cert_name: string;
        issuing_body: string | null;
        issue_date: Date;
        expiry_date: Date | null;
        credential_id: string | null;
        file_url: string | null;
        is_verified: boolean;
    }[]>;
    addCertificate(employeeId: string, data: {
        certName: string;
        issuingBody?: string;
        issueDate: string;
        expiryDate?: string;
        credentialId?: string;
        fileUrl?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        cert_name: string;
        issuing_body: string | null;
        issue_date: Date;
        expiry_date: Date | null;
        credential_id: string | null;
        file_url: string | null;
        is_verified: boolean;
    }>;
    updateCertificate(id: string, employeeId: string, data: {
        certName?: string;
        issuingBody?: string;
        expiryDate?: string;
        credentialId?: string;
        fileUrl?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        cert_name: string;
        issuing_body: string | null;
        issue_date: Date;
        expiry_date: Date | null;
        credential_id: string | null;
        file_url: string | null;
        is_verified: boolean;
    }>;
    deleteCertificate(id: string, employeeId: string): Promise<{
        success: boolean;
    }>;
}
declare const _default: LearningService;
export default _default;
//# sourceMappingURL=learning.service.d.ts.map