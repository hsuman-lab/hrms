import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import offboardingService from '../services/offboarding.service';
import prisma from '../config/database';

class OffboardingController {
  private async getEmployeeId(req: AuthRequest): Promise<string> {
    const emp = await prisma.employee.findUnique({ where: { user_id: req.user!.userId }, select: { id: true } });
    if (!emp) throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
    return emp.id;
  }

  getMyResignation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.getMyResignation(empId) });
    } catch (e) { next(e); }
  };

  submitResignation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await offboardingService.submitResignation(empId, req.body) });
    } catch (e) { next(e); }
  };

  withdrawResignation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.withdrawResignation(empId) });
    } catch (e) { next(e); }
  };

  getPendingResignations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.getPendingResignations(empId) });
    } catch (e) { next(e); }
  };

  actionResignation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      const { status, remarks } = req.body;
      res.json({ success: true, data: await offboardingService.actionResignation(req.params.id, empId, status, remarks) });
    } catch (e) { next(e); }
  };

  getExitInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.getExitInterview(empId) });
    } catch (e) { next(e); }
  };

  submitExitInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.submitExitInterview(empId, req.body) });
    } catch (e) { next(e); }
  };

  getFnFSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.getFnFSettlement(empId) });
    } catch (e) { next(e); }
  };

  upsertFnFSettlement = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.upsertFnFSettlement(empId, req.body) });
    } catch (e) { next(e); }
  };

  getMyOffboardingChecklist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.getMyOffboardingChecklist(empId) });
    } catch (e) { next(e); }
  };

  bootstrapOffboardingChecklist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      res.json({ success: true, data: await offboardingService.bootstrapOffboardingChecklist(employeeId) });
    } catch (e) { next(e); }
  };

  updateOffboardingItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await offboardingService.updateOffboardingItem(req.params.id, empId, req.body) });
    } catch (e) { next(e); }
  };
}

export default new OffboardingController();
