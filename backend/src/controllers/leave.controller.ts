import { Response, NextFunction } from 'express';
import { z } from 'zod';
import leaveService from '../services/leave.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

const applyLeaveSchema = z.object({
  leaveTypeId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().optional(),
});

const leaveTypeSchema = z.object({
  leaveName: z.string().min(1),
  description: z.string().optional(),
  maxDays: z.number().positive(),
  isPaid: z.boolean(),
  carryForward: z.boolean(),
});

export class LeaveController {
  async apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = applyLeaveSchema.parse(req.body);
      const request = await leaveService.applyLeave(req.user!.employeeId!, data);
      await logAudit(req.user?.userId, 'APPLY_LEAVE', 'LeaveRequest', request.id);
      res.status(201).json({ success: true, data: request });
    } catch (err) {
      next(err);
    }
  }

  async getMyLeaves(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const leaves = await leaveService.getMyLeaves(req.user!.employeeId!, status);
      res.json({ success: true, data: leaves });
    } catch (err) {
      next(err);
    }
  }

  async getBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const balances = await leaveService.getLeaveBalance(req.user!.employeeId!);
      res.json({ success: true, data: balances });
    } catch (err) {
      next(err);
    }
  }

  async getPendingApprovals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const managerId = req.user!.employeeId!;
      const requests = await leaveService.getPendingApprovalsForManager(managerId);
      res.json({ success: true, data: requests });
    } catch (err) {
      next(err);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, remarks } = approvalSchema.parse(req.body);
      const result = await leaveService.approveOrRejectLeave(
        req.params.id, req.user!.employeeId!, status, remarks
      );
      await logAudit(req.user?.userId, `LEAVE_${status}`, 'LeaveRequest', req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getLeaveTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const types = await leaveService.getAllLeaveTypes();
      res.json({ success: true, data: types });
    } catch (err) {
      next(err);
    }
  }

  async createLeaveType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = leaveTypeSchema.parse(req.body);
      const leaveType = await leaveService.createLeaveType({ ...data, createdBy: req.user!.userId });
      await logAudit(req.user?.userId, 'CREATE_LEAVE_TYPE', 'LeaveType', leaveType.id);
      res.status(201).json({ success: true, data: leaveType });
    } catch (err) {
      next(err);
    }
  }

  async updateLeaveType(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = leaveTypeSchema.partial().parse(req.body);
      const leaveType = await leaveService.updateLeaveType(req.params.id, {
        leaveName: data.leaveName,
        description: data.description,
        maxDays: data.maxDays,
        isPaid: data.isPaid,
        carryForward: data.carryForward,
      });
      res.json({ success: true, data: leaveType });
    } catch (err) {
      next(err);
    }
  }

  async getAllLeavesHR(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, month, year } = req.query;
      const leaves = await leaveService.getAllLeavesForHR(
        status as string,
        month ? parseInt(month as string) : undefined,
        year ? parseInt(year as string) : undefined
      );
      res.json({ success: true, data: leaves });
    } catch (err) {
      next(err);
    }
  }
}

export default new LeaveController();
