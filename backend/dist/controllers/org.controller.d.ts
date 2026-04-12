import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
declare class OrgController {
    private getEmployeeId;
    getOrgChart: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getTeamDirectory: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getJobPostings: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getJobPostingById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    createJobPosting: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateJobPosting: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    applyToJob: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getMyApplications: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getApplicationsForPosting: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateApplicationStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: OrgController;
export default _default;
//# sourceMappingURL=org.controller.d.ts.map