import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
declare class OnboardingController {
    private getEmployeeId;
    getMasterTasks: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    createMasterTask: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getMyChecklist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    bootstrapChecklist: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateChecklistItem: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getPolicies: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    acknowledgePolicy: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getExperience: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    submitExperience: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: OnboardingController;
export default _default;
//# sourceMappingURL=onboarding.controller.d.ts.map