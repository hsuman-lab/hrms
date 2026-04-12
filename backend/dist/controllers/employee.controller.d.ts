import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class EmployeeController {
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateSalaryStructure(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    hasSubordinates(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: EmployeeController;
export default _default;
//# sourceMappingURL=employee.controller.d.ts.map