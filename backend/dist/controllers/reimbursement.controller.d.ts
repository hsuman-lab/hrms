import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class ReimbursementController {
    apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMine(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPendingForManager(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    action(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllHR(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ReimbursementController;
export default _default;
//# sourceMappingURL=reimbursement.controller.d.ts.map