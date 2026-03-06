import { Response, NextFunction } from 'express';
import payrollService from '../services/payroll.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

export class PayrollController {
  async generate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = parseInt(req.body.month);
      const year = parseInt(req.body.year);
      if (!month || !year || month < 1 || month > 12) {
        res.status(400).json({ success: false, error: 'Invalid month or year' });
        return;
      }
      const result = await payrollService.generatePayroll(month, year, req.user!.userId);
      await logAudit(req.user?.userId, 'GENERATE_PAYROLL', 'PayrollRecord', undefined, { month, year });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getMonthly(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const records = await payrollService.getMonthlyPayroll(month, year);
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  }

  async getMyPayroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await payrollService.getEmployeePayroll(req.user!.employeeId!);
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  }

  async exportCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const csv = await payrollService.exportPayrollCSV(month, year);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payroll-${year}-${month}.csv`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const summary = await payrollService.getPayrollSummary(year);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }
}

export default new PayrollController();
