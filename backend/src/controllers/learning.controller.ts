import { Response, NextFunction } from 'express';
import { z } from 'zod';
import learningService from '../services/learning.service';
import { AuthRequest } from '../types';
import { logAudit } from '../utils/audit';

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  is_mandatory: z.boolean().optional(),
  duration_mins: z.number().int().positive().optional(),
});

const enrollSchema = z.object({
  employee_ids: z.array(z.string()).optional(), // omit to enroll all
  due_date: z.string().optional(),
});

const progressSchema = z.object({
  progress_pct: z.number().int().min(0).max(100),
});

export class LearningController {
  // ── HR: course management ───────────────────────────────────────────────────

  async getCourses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await learningService.getAllCourses();
      res.json({ success: true, data: courses });
    } catch (err) { next(err); }
  }

  async createCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = courseSchema.parse(req.body);
      const course = await learningService.createCourse({ ...body, createdBy: req.user!.userId });
      await logAudit(req.user?.userId, 'CREATE_COURSE', 'Course', course.id);
      res.status(201).json({ success: true, data: course });
    } catch (err) { next(err); }
  }

  async updateCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = courseSchema.partial().parse(req.body);
      const course = await learningService.updateCourse(req.params.id, body);
      res.json({ success: true, data: course });
    } catch (err) { next(err); }
  }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await learningService.deleteCourse(req.params.id);
      await logAudit(req.user?.userId, 'DELETE_COURSE', 'Course', req.params.id);
      res.json({ success: true, message: 'Course deleted' });
    } catch (err) { next(err); }
  }

  // ── HR: enrollments ─────────────────────────────────────────────────────────

  async enrollToCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employee_ids, due_date } = enrollSchema.parse(req.body);
      let result;
      if (employee_ids && employee_ids.length > 0) {
        result = await learningService.enrollEmployees(req.params.id, employee_ids, due_date);
      } else {
        result = await learningService.enrollAll(req.params.id, due_date);
      }
      await logAudit(req.user?.userId, 'ENROLL_COURSE', 'Course', req.params.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getCourseEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await learningService.getCourseEnrollments(req.params.id);
      res.json({ success: true, data: enrollments });
    } catch (err) { next(err); }
  }

  async getLearningStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await learningService.getLearningStats();
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  }

  // ── Employee: my courses ────────────────────────────────────────────────────

  async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      const enrollments = await learningService.getMyEnrollments(req.user.employeeId);
      res.json({ success: true, data: enrollments });
    } catch (err) { next(err); }
  }

  async updateProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      const { progress_pct } = progressSchema.parse(req.body);
      const enrollment = await learningService.updateProgress(req.params.courseId, req.user.employeeId, progress_pct);
      res.json({ success: true, data: enrollment });
    } catch (err) { next(err); }
  }

  // ── Employee: certificates ──────────────────────────────────────────────────

  async getMyCertificates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      res.json({ success: true, data: await learningService.getMyCertificates(req.user.employeeId) });
    } catch (err) { next(err); }
  }

  async addCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      res.status(201).json({ success: true, data: await learningService.addCertificate(req.user.employeeId, req.body) });
    } catch (err) { next(err); }
  }

  async updateCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      res.json({ success: true, data: await learningService.updateCertificate(req.params.id, req.user.employeeId, req.body) });
    } catch (err) { next(err); }
  }

  async deleteCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.employeeId) { res.status(400).json({ success: false, error: 'No employee record' }); return; }
      res.json(await learningService.deleteCertificate(req.params.id, req.user.employeeId));
    } catch (err) { next(err); }
  }
}

export default new LearningController();
