import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class PayrollController {
    generate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMonthly(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyPayroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    exportCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: PayrollController;
export default _default;
//# sourceMappingURL=payroll.controller.d.ts.map