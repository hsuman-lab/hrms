import { Response, NextFunction } from 'express';
import { z } from 'zod';
import hrService from '../services/hr.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

const deptSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export class HRController {
  async getDepartments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const depts = await hrService.getAllDepartments();
      res.json({ success: true, data: depts });
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = deptSchema.parse(req.body);
      const dept = await hrService.createDepartment(name, description);
      await logAudit(req.user?.userId, 'CREATE_DEPARTMENT', 'Department', dept.id);
      res.status(201).json({ success: true, data: dept });
    } catch (err) {
      next(err);
    }
  }

  async updateDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = deptSchema.partial().parse(req.body);
      const dept = await hrService.updateDepartment(req.params.id, name, description);
      res.json({ success: true, data: dept });
    } catch (err) {
      next(err);
    }
  }

  async deleteDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await hrService.deleteDepartment(req.params.id);
      await logAudit(req.user?.userId, 'DELETE_DEPARTMENT', 'Department', req.params.id);
      res.json({ success: true, message: 'Department deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getRoles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await hrService.getAllRoles();
      res.json({ success: true, data: roles });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await hrService.getOrgAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = z.object({ roleId: z.string().min(1) }).parse(req.body);
      await hrService.updateUserRole(req.params.userId, roleId);
      res.json({ success: true, message: 'Role updated' });
    } catch (err) {
      next(err);
    }
  }

  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await hrService.toggleUserStatus(req.params.userId);
      res.json({ success: true, data: { is_active: user.is_active } });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await hrService.getAuditLogs(page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new HRController();
