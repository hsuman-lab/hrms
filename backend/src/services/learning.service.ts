import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class LearningService {
  // ── Courses ──────────────────────────────────────────────────────────────────

  async getAllCourses() {
    return prisma.course.findMany({
      orderBy: [{ is_mandatory: 'desc' }, { created_at: 'asc' }],
      include: {
        _count: { select: { enrollments: true } },
        creator: { select: { employee: { select: { first_name: true, last_name: true } } } },
      },
    });
  }

  async createCourse(data: {
    title: string;
    description?: string;
    category?: string;
    is_mandatory?: boolean;
    duration_mins?: number;
    createdBy: string;
  }) {
    return prisma.course.create({
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

  async updateCourse(id: string, data: {
    title?: string;
    description?: string;
    category?: string;
    is_mandatory?: boolean;
    duration_mins?: number;
  }) {
    return prisma.course.update({ where: { id }, data });
  }

  async deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
  }

  // ── Enrollments ───────────────────────────────────────────────────────────────

  /** Enroll one or more employees in a course (idempotent). */
  async enrollEmployees(courseId: string, employeeIds: string[], dueDate?: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const data = employeeIds.map((employee_id) => ({
      course_id: courseId,
      employee_id,
      due_date: dueDate ? new Date(dueDate) : undefined,
    }));

    // skipDuplicates ensures idempotency
    return prisma.courseEnrollment.createMany({ data, skipDuplicates: true });
  }

  /** Enroll ALL active employees in a course. */
  async enrollAll(courseId: string, dueDate?: string) {
    const employees = await prisma.employee.findMany({
      where: { employment_status: 'ACTIVE' },
      select: { id: true },
    });
    return this.enrollEmployees(courseId, employees.map((e) => e.id), dueDate);
  }

  /** Employee updates their own progress. */
  async updateProgress(courseId: string, employeeId: string, progressPct: number) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { course_id_employee_id: { course_id: courseId, employee_id: employeeId } },
    });
    if (!enrollment) throw new AppError('Enrollment not found', 404);

    const pct = Math.max(0, Math.min(100, progressPct));
    const status = pct === 100 ? 'COMPLETED' : pct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
    const completed_at = pct === 100 ? new Date() : null;

    return prisma.courseEnrollment.update({
      where: { course_id_employee_id: { course_id: courseId, employee_id: employeeId } },
      data: { progress_pct: pct, status, completed_at },
      include: { course: true },
    });
  }

  /** Get all enrollments for an employee. */
  async getMyEnrollments(employeeId: string) {
    return prisma.courseEnrollment.findMany({
      where: { employee_id: employeeId },
      include: { course: true },
      orderBy: [{ course: { is_mandatory: 'desc' } }, { assigned_at: 'asc' }],
    });
  }

  /** HR: get all enrollments across all employees for a course. */
  async getCourseEnrollments(courseId: string) {
    return prisma.courseEnrollment.findMany({
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
      prisma.course.count(),
      prisma.course.count({ where: { is_mandatory: true } }),
      prisma.courseEnrollment.count(),
      prisma.courseEnrollment.count({ where: { status: 'COMPLETED' } }),
      prisma.courseEnrollment.count({
        where: { status: { not: 'COMPLETED' }, due_date: { lt: new Date() } },
      }),
    ]);
    return { totalCourses, mandatoryCourses, totalEnrollments, completed, overdue };
  }
}

export default new LearningService();
