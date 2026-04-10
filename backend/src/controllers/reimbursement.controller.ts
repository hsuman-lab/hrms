import { Response, NextFunction } from 'express';
import { z } from 'zod';
import reimbursementService from '../services/reimbursement.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

const CATEGORIES = ['TRAVEL', 'FOOD', 'MEDICAL', 'ACCOMMODATION', 'OTHER'] as const;

const applySchema = z.object({
  category:    z.enum(CATEGORIES),
  amount:      z.number().positive(),
  description: z.string().min(5),
  billDate:    z.string(),
});

const actionSchema = z.object({
  status:  z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().optional(),
});

export class ReimbursementController {
  async apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      const data = applySchema.parse(req.body);
      const result = await reimbursementService.apply(req.user.employeeId, data);
      await logAudit(req.user.userId, 'APPLY_REIMBURSEMENT', 'Reimbursement', result.id);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getMine(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      const result = await reimbursementService.getMyReimbursements(req.user.employeeId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getPendingForManager(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      const result = await reimbursementService.getPendingForManager(req.user.employeeId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async action(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      const { status, remarks } = actionSchema.parse(req.body);
      const result = await reimbursementService.approveOrReject(req.params.id, req.user.employeeId, status, remarks);
      await logAudit(req.user.userId, `REIMBURSEMENT_${status}`, 'Reimbursement', req.params.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getAllHR(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const result = await reimbursementService.getAllForHR(status);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}

export default new ReimbursementController();
