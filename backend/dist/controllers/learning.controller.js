"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningController = void 0;
const zod_1 = require("zod");
const learning_service_1 = __importDefault(require("../services/learning.service"));
const audit_1 = require("../utils/audit");
const courseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    is_mandatory: zod_1.z.boolean().optional(),
    duration_mins: zod_1.z.number().int().positive().optional(),
});
const enrollSchema = zod_1.z.object({
    employee_ids: zod_1.z.array(zod_1.z.string()).optional(), // omit to enroll all
    due_date: zod_1.z.string().optional(),
});
const progressSchema = zod_1.z.object({
    progress_pct: zod_1.z.number().int().min(0).max(100),
});
class LearningController {
    // ── HR: course management ───────────────────────────────────────────────────
    async getCourses(req, res, next) {
        try {
            const courses = await learning_service_1.default.getAllCourses();
            res.json({ success: true, data: courses });
        }
        catch (err) {
            next(err);
        }
    }
    async createCourse(req, res, next) {
        try {
            const body = courseSchema.parse(req.body);
            const course = await learning_service_1.default.createCourse({ ...body, createdBy: req.user.userId });
            await (0, audit_1.logAudit)(req.user?.userId, 'CREATE_COURSE', 'Course', course.id);
            res.status(201).json({ success: true, data: course });
        }
        catch (err) {
            next(err);
        }
    }
    async updateCourse(req, res, next) {
        try {
            const body = courseSchema.partial().parse(req.body);
            const course = await learning_service_1.default.updateCourse(req.params.id, body);
            res.json({ success: true, data: course });
        }
        catch (err) {
            next(err);
        }
    }
    async deleteCourse(req, res, next) {
        try {
            await learning_service_1.default.deleteCourse(req.params.id);
            await (0, audit_1.logAudit)(req.user?.userId, 'DELETE_COURSE', 'Course', req.params.id);
            res.json({ success: true, message: 'Course deleted' });
        }
        catch (err) {
            next(err);
        }
    }
    // ── HR: enrollments ─────────────────────────────────────────────────────────
    async enrollToCourse(req, res, next) {
        try {
            const { employee_ids, due_date } = enrollSchema.parse(req.body);
            let result;
            if (employee_ids && employee_ids.length > 0) {
                result = await learning_service_1.default.enrollEmployees(req.params.id, employee_ids, due_date);
            }
            else {
                result = await learning_service_1.default.enrollAll(req.params.id, due_date);
            }
            await (0, audit_1.logAudit)(req.user?.userId, 'ENROLL_COURSE', 'Course', req.params.id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getCourseEnrollments(req, res, next) {
        try {
            const enrollments = await learning_service_1.default.getCourseEnrollments(req.params.id);
            res.json({ success: true, data: enrollments });
        }
        catch (err) {
            next(err);
        }
    }
    async getLearningStats(req, res, next) {
        try {
            const stats = await learning_service_1.default.getLearningStats();
            res.json({ success: true, data: stats });
        }
        catch (err) {
            next(err);
        }
    }
    // ── Employee: my courses ────────────────────────────────────────────────────
    async getMyEnrollments(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            const enrollments = await learning_service_1.default.getMyEnrollments(req.user.employeeId);
            res.json({ success: true, data: enrollments });
        }
        catch (err) {
            next(err);
        }
    }
    async updateProgress(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            const { progress_pct } = progressSchema.parse(req.body);
            const enrollment = await learning_service_1.default.updateProgress(req.params.courseId, req.user.employeeId, progress_pct);
            res.json({ success: true, data: enrollment });
        }
        catch (err) {
            next(err);
        }
    }
    // ── Employee: certificates ──────────────────────────────────────────────────
    async getMyCertificates(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            res.json({ success: true, data: await learning_service_1.default.getMyCertificates(req.user.employeeId) });
        }
        catch (err) {
            next(err);
        }
    }
    async addCertificate(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            res.status(201).json({ success: true, data: await learning_service_1.default.addCertificate(req.user.employeeId, req.body) });
        }
        catch (err) {
            next(err);
        }
    }
    async updateCertificate(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            res.json({ success: true, data: await learning_service_1.default.updateCertificate(req.params.id, req.user.employeeId, req.body) });
        }
        catch (err) {
            next(err);
        }
    }
    async deleteCertificate(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            res.json(await learning_service_1.default.deleteCertificate(req.params.id, req.user.employeeId));
        }
        catch (err) {
            next(err);
        }
    }
}
exports.LearningController = LearningController;
exports.default = new LearningController();
//# sourceMappingURL=learning.controller.js.map