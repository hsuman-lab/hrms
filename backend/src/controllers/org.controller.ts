import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import orgService from '../services/org.service';
import prisma from '../config/database';

class OrgController {
  private async getEmployeeId(req: AuthRequest): Promise<string> {
    const emp = await prisma.employee.findUnique({ where: { user_id: req.user!.userId }, select: { id: true } });
    if (!emp) throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
    return emp.id;
  }

  getOrgChart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await orgService.getOrgChart() });
    } catch (e) { next(e); }
  };

  getTeamDirectory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, departmentId } = req.query as Record<string, string>;
      res.json({ success: true, data: await orgService.getTeamDirectory(+page || 1, +limit || 20, search, departmentId) });
    } catch (e) { next(e); }
  };

  // Job Postings
  getJobPostings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query as { status?: string };
      res.json({ success: true, data: await orgService.getJobPostings(true, status || 'OPEN') });
    } catch (e) { next(e); }
  };

  getJobPostingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await orgService.getJobPostingById(req.params.id) });
    } catch (e) { next(e); }
  };

  createJobPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: await orgService.createJobPosting(req.user!.userId, req.body) });
    } catch (e) { next(e); }
  };

  updateJobPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await orgService.updateJobPosting(req.params.id, req.body) });
    } catch (e) { next(e); }
  };

  // Applications
  applyToJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await orgService.applyToJob(empId, req.params.id, req.body.coverNote) });
    } catch (e) { next(e); }
  };

  getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await orgService.getMyApplications(empId) });
    } catch (e) { next(e); }
  };

  getApplicationsForPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await orgService.getApplicationsForPosting(req.params.id) });
    } catch (e) { next(e); }
  };

  updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await orgService.updateApplicationStatus(req.params.id, req.body.status) });
    } catch (e) { next(e); }
  };
}

export default new OrgController();
