import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
declare class PmsController {
    private getEmployeeId;
    getMyGoals: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getTeamGoals: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    createGoal: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateGoal: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getMySelfAssessments: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    upsertSelfAssessment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getPendingReviews: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    submitManagerReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getFeedbackReceived: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    submitFeedback: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getSkills: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    addSkill: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteSkill: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getSkillPlans: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    createSkillPlan: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateSkillPlan: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: PmsController;
export default _default;
//# sourceMappingURL=pms.controller.d.ts.map