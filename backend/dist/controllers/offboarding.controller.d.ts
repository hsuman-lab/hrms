import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
declare class OffboardingController {
    private getEmployeeId;
    getMyResignation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    submitResignation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    withdrawResignation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getPendingResignations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    actionResignation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getExitInterview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    submitExitInterview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getFnFSettlement: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    upsertFnFSettlement: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getMyOffboardingChecklist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    bootstrapOffboardingChecklist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateOffboardingItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: OffboardingController;
export default _default;
//# sourceMappingURL=offboarding.controller.d.ts.map