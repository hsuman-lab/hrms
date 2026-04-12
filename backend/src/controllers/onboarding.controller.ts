import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import onboardingService from '../services/onboarding.service';
import prisma from '../config/database';

class OnboardingController {
  private async getEmployeeId(req: AuthRequest): Promise<string> {
    const emp = await prisma.employee.findUnique({ where: { user_id: req.user!.userId }, select: { id: true } });
    if (!emp) throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
    return emp.id;
  }

  getMasterTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await onboardingService.getMasterTasks() });
    } catch (e) { next(e); }
  };

  createMasterTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: await onboardingService.createMasterTask(req.body) });
    } catch (e) { next(e); }
  };

  getMyChecklist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await onboardingService.getMyChecklist(empId) });
    } catch (e) { next(e); }
  };

  bootstrapChecklist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      res.json({ success: true, data: await onboardingService.bootstrapChecklist(employeeId) });
    } catch (e) { next(e); }
  };

  updateChecklistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await onboardingService.updateChecklistItem(req.params.id, empId, req.body) });
    } catch (e) { next(e); }
  };

  getPolicies = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await onboardingService.getPolicies(empId) });
    } catch (e) { next(e); }
  };

  acknowledgePolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      res.json({ success: true, data: await onboardingService.acknowledgePolicy(empId, { ...req.body, ipAddress }) });
    } catch (e) { next(e); }
  };

  getExperience = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await onboardingService.getExperience(empId) });
    } catch (e) { next(e); }
  };

  submitExperience = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await onboardingService.submitExperience(empId, req.body) });
    } catch (e) { next(e); }
  };
}

export default new OnboardingController();
