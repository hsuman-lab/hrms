import { Response, NextFunction } from 'express';
import { z } from 'zod';
import employeeService from '../services/employee.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  departmentId: z.string().min(1).optional(),
  managerId: z.string().min(1).optional(),
  joiningDate: z.string().optional(),
  baseSalary: z.number().positive().optional(),
  employeeCode: z.string().min(1),
});

const updateEmployeeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().min(1).optional(),
  managerId: z.string().min(1).optional(),
  employmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']).optional(),
  baseSalary: z.number().positive().optional(),
});

export class EmployeeController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await employeeService.getAllEmployees(page, limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.getMyProfile(req.user!.userId);
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createEmployeeSchema.parse(req.body);
      const employee = await employeeService.createEmployee(data);
      await logAudit(req.user?.userId, 'CREATE_EMPLOYEE', 'Employee', employee.id);
      res.status(201).json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateEmployeeSchema.parse(req.body);
      const employee = await employeeService.updateEmployee(req.params.id, data);
      await logAudit(req.user?.userId, 'UPDATE_EMPLOYEE', 'Employee', req.params.id);
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  }

  async getTeam(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const managerId = req.user!.employeeId!;
      const team = await employeeService.getTeamMembers(managerId);
      res.json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.user!.employeeId!;
      const stats = await employeeService.getDashboardStats(employeeId);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

export default new EmployeeController();
