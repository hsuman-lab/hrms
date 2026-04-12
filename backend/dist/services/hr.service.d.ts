export declare class HRService {
    getAllDepartments(): Promise<({
        _count: {
            employees: number;
        };
    } & {
        id: string;
        created_at: Date;
        description: string | null;
        department_name: string;
    })[]>;
    createDepartment(name: string, description?: string): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        department_name: string;
    }>;
    updateDepartment(id: string, name?: string, description?: string): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        department_name: string;
    }>;
    deleteDepartment(id: string): Promise<{
        id: string;
        created_at: Date;
        description: string | null;
        department_name: string;
    }>;
    getAllRoles(): Promise<{
        id: string;
        created_at: Date;
        role_name: string;
        description: string | null;
    }[]>;
    getOrgAnalytics(): Promise<{
        totalEmployees: number;
        attendanceToday: number;
        pendingLeaves: number;
        byDepartment: {
            department: string;
            count: number;
        }[];
        byRole: {
            role: string;
            count: number;
        }[];
    }>;
    updateUserRole(userId: string, roleId: string): Promise<{
        id: string;
        email: string;
        password_hash: string;
        role_id: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    toggleUserStatus(userId: string): Promise<{
        id: string;
        email: string;
        password_hash: string;
        role_id: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    getAuditLogs(page?: number, limit?: number): Promise<{
        logs: ({
            user: {
                email: string;
            } | null;
        } & {
            id: string;
            created_at: Date;
            user_id: string | null;
            action: string | null;
            entity_type: string | null;
            entity_id: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
declare const _default: HRService;
export default _default;
//# sourceMappingURL=hr.service.d.ts.map