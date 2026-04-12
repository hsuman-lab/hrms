import { Request } from 'express';
export interface AuthPayload {
    userId: string;
    email: string;
    role: string;
    employeeId?: string;
}
export interface AuthRequest extends Request {
    user?: AuthPayload;
}
export type RoleName = 'EMPLOYEE' | 'EMPLOYEE_MANAGER' | 'HR' | 'HR_MANAGER' | 'FINANCE';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
}
//# sourceMappingURL=index.d.ts.map