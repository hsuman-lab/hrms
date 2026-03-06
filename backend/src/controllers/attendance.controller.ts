import { Response, NextFunction } from 'express';
import attendanceService from '../services/attendance.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export class AttendanceController {
  async clockIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId!;
      const record = await attendanceService.clockIn(employeeId);
      await logAudit(req.user?.userId, 'CLOCK_IN', 'Attendance', record.id);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  async clockOut(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId!;
      const record = await attendanceService.clockOut(employeeId);
      await logAudit(req.user?.userId, 'CLOCK_OUT', 'Attendance', record.id);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId!;
      const { startDate, endDate, page, limit } = req.query as Record<string, string>;
      const result = await attendanceService.getAttendanceHistory(
        employeeId, startDate, endDate,
        parseInt(page) || 1, parseInt(limit) || 30
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getToday(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.getTodayStatus(req.user!.employeeId!);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  async getTeamAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const managerId = req.user!.employeeId!;
      const date = req.query.date as string;
      const result = await attendanceService.getTeamAttendance(managerId, date);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMonthlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const result = await attendanceService.getMonthlyReport(year, month);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new AttendanceController();
