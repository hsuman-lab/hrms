export declare class AuthService {
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: string | undefined;
            employee: {
                id: string;
                employee_code: string;
                first_name: string | null;
                last_name: string | null;
                department: string | undefined;
            } | null;
        };
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map