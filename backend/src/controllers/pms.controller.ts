import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import pmsService from '../services/pms.service';
import prisma from '../config/database';

class PmsController {
  private async getEmployeeId(req: AuthRequest): Promise<string> {
    const emp = await prisma.employee.findUnique({ where: { user_id: req.user!.userId }, select: { id: true } });
    if (!emp) throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
    return emp.id;
  }

  // Goals
  getMyGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      const { period } = req.query as { period?: string };
      res.json({ success: true, data: await pmsService.getMyGoals(empId, period) });
    } catch (e) { next(e); }
  };

  getTeamGoals = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      const { period } = req.query as { period?: string };
      res.json({ success: true, data: await pmsService.getTeamGoals(empId, period) });
    } catch (e) { next(e); }
  };

  createGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await pmsService.createGoal(empId, req.body) });
    } catch (e) { next(e); }
  };

  updateGoal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.updateGoal(req.params.id, empId, req.body) });
    } catch (e) { next(e); }
  };

  // Self Assessments
  getMySelfAssessments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.getMySelfAssessments(empId) });
    } catch (e) { next(e); }
  };

  upsertSelfAssessment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.upsertSelfAssessment(empId, req.body) });
    } catch (e) { next(e); }
  };

  // Manager Review
  getPendingReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.getPendingReviews(empId) });
    } catch (e) { next(e); }
  };

  submitManagerReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.submitManagerReview(empId, req.params.id, req.body) });
    } catch (e) { next(e); }
  };

  // 360 Feedback
  getFeedbackReceived = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.getFeedbackReceived(empId) });
    } catch (e) { next(e); }
  };

  submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await pmsService.submitFeedback(empId, req.body) });
    } catch (e) { next(e); }
  };

  // Skills
  getSkills = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.getSkills(empId) });
    } catch (e) { next(e); }
  };

  addSkill = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await pmsService.addSkill(empId, req.body) });
    } catch (e) { next(e); }
  };

  deleteSkill = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json(await pmsService.deleteSkill(req.params.id, empId));
    } catch (e) { next(e); }
  };

  // Skill Plans
  getSkillPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.getSkillPlans(empId) });
    } catch (e) { next(e); }
  };

  createSkillPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await pmsService.createSkillPlan(empId, req.body) });
    } catch (e) { next(e); }
  };

  updateSkillPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await pmsService.updateSkillPlan(req.params.id, empId, req.body) });
    } catch (e) { next(e); }
  };
}

export default new PmsController();
