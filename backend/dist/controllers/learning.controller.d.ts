import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class LearningController {
    getCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    enrollToCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getCourseEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getLearningStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyCertificates(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    addCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: LearningController;
export default _default;
//# sourceMappingURL=learning.controller.d.ts.map