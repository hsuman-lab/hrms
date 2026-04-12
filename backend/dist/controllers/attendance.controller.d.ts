import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class AttendanceController {
    clockIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    clockOut(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getToday(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTeamAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMonthlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AttendanceController;
export default _default;
//# sourceMappingURL=attendance.controller.d.ts.map