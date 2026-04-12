import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class HRController {
    getDepartments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getRoles(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: HRController;
export default _default;
//# sourceMappingURL=hr.controller.d.ts.map