"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class LearningService {
    // ── Courses ──────────────────────────────────────────────────────────────────
    async getAllCourses() {
        return database_1.default.course.findMany({
            orderBy: [{ is_mandatory: 'desc' }, { created_at: 'asc' }],
            include: {
                _count: { select: { enrollments: true } },
                creator: { select: { employee: { select: { first_name: true, last_name: true } } } },
            },
        });
    }
    async createCourse(data) {
        return database_1.default.course.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category ?? 'GENERAL',
                is_mandatory: data.is_mandatory ?? false,
                duration_mins: data.duration_mins,
                created_by: data.createdBy,
            },
        });
    }
    async updateCourse(id, data) {
        return database_1.default.course.update({ where: { id }, data });
    }
    async deleteCourse(id) {
        return database_1.default.course.delete({ where: { id } });
    }
    // ── Enrollments ───────────────────────────────────────────────────────────────
    /** Enroll one or more employees in a course (idempotent). */
    async enrollEmployees(courseId, employeeIds, dueDate) {
        const course = await database_1.default.course.findUnique({ where: { id: courseId } });
        if (!course)
            throw new errorHandler_1.AppError('Course not found', 404);
        const data = employeeIds.map((employee_id) => ({
            course_id: courseId,
            employee_id,
            due_date: dueDate ? new Date(dueDate) : undefined,
        }));
        // skipDuplicates ensures idempotency
        return database_1.default.courseEnrollment.createMany({ data, skipDuplicates: true });
    }
    /** Enroll ALL active employees in a course. */
    async enrollAll(courseId, dueDate) {
        const employees = await database_1.default.employee.findMany({
            where: { employment_status: 'ACTIVE' },
            select: { id: true },
        });
        return this.enrollEmployees(courseId, employees.map((e) => e.id), dueDate);
    }
    /** Employee updates their own progress. */
    async updateProgress(courseId, employeeId, progressPct) {
        const enrollment = await database_1.default.courseEnrollment.findUnique({
            where: { course_id_employee_id: { course_id: courseId, employee_id: employeeId } },
        });
        if (!enrollment)
            throw new errorHandler_1.AppError('Enrollment not found', 404);
        const pct = Math.max(0, Math.min(100, progressPct));
        const status = pct === 100 ? 'COMPLETED' : pct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
        const completed_at = pct === 100 ? new Date() : null;
        return database_1.default.courseEnrollment.update({
            where: { course_id_employee_id: { course_id: courseId, employee_id: employeeId } },
            data: { progress_pct: pct, status, completed_at },
            include: { course: true },
        });
    }
    /** Get all enrollments for an employee. */
    async getMyEnrollments(employeeId) {
        return database_1.default.courseEnrollment.findMany({
            where: { employee_id: employeeId },
            include: { course: true },
            orderBy: [{ course: { is_mandatory: 'desc' } }, { assigned_at: 'asc' }],
        });
    }
    /** HR: get all enrollments across all employees for a course. */
    async getCourseEnrollments(courseId) {
        return database_1.default.courseEnrollment.findMany({
            where: { course_id: courseId },
            include: {
                employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: { select: { department_name: true } } } },
            },
            orderBy: { assigned_at: 'asc' },
        });
    }
    /** HR: overall L&D stats. */
    async getLearningStats() {
        const [totalCourses, mandatoryCourses, totalEnrollments, completed, overdue] = await Promise.all([
            database_1.default.course.count(),
            database_1.default.course.count({ where: { is_mandatory: true } }),
            database_1.default.courseEnrollment.count(),
            database_1.default.courseEnrollment.count({ where: { status: 'COMPLETED' } }),
            database_1.default.courseEnrollment.count({
                where: { status: { not: 'COMPLETED' }, due_date: { lt: new Date() } },
            }),
        ]);
        return { totalCourses, mandatoryCourses, totalEnrollments, completed, overdue };
    }
    // ── Certificates ─────────────────────────────────────────────────────────────
    async getMyCertificates(employeeId) {
        return database_1.default.certificate.findMany({
            where: { employee_id: employeeId },
            orderBy: { issue_date: 'desc' },
        });
    }
    async addCertificate(employeeId, data) {
        return database_1.default.certificate.create({
            data: {
                employee_id: employeeId,
                cert_name: data.certName,
                issuing_body: data.issuingBody,
                issue_date: new Date(data.issueDate),
                expiry_date: data.expiryDate ? new Date(data.expiryDate) : undefined,
                credential_id: data.credentialId,
                file_url: data.fileUrl,
            },
        });
    }
    async updateCertificate(id, employeeId, data) {
        const cert = await database_1.default.certificate.findUnique({ where: { id } });
        if (!cert || cert.employee_id !== employeeId) {
            throw new errorHandler_1.AppError('Certificate not found', 404);
        }
        return database_1.default.certificate.update({
            where: { id },
            data: {
                cert_name: data.certName,
                issuing_body: data.issuingBody,
                expiry_date: data.expiryDate ? new Date(data.expiryDate) : undefined,
                credential_id: data.credentialId,
                file_url: data.fileUrl,
            },
        });
    }
    async deleteCertificate(id, employeeId) {
        const cert = await database_1.default.certificate.findUnique({ where: { id } });
        if (!cert || cert.employee_id !== employeeId) {
            throw new errorHandler_1.AppError('Certificate not found', 404);
        }
        await database_1.default.certificate.delete({ where: { id } });
        return { success: true };
    }
}
exports.LearningService = LearningService;
exports.default = new LearningService();
//# sourceMappingURL=learning.service.js.map