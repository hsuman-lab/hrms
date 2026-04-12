import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class LeaveController {
    apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyLeaves(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPendingApprovals(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    approve(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getLeaveTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createLeaveType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateLeaveType(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllLeavesHR(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: LeaveController;
export default _default;
//# sourceMappingURL=leave.controller.d.ts.map