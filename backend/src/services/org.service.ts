import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class OrgService {
  // ── Org Chart / Team Directory ─────────────────────────────────────────────
  async getOrgChart() {
    // Return all employees with their manager relationship for tree building on frontend
    return prisma.employee.findMany({
      where: { employment_status: 'ACTIVE' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        employee_code: true,
        manager_id: true,
        department: { select: { id: true, department_name: true } },
        user: { select: { email: true, role: { select: { role_name: true } } } },
      },
      orderBy: { first_name: 'asc' },
    });
  }

  async getTeamDirectory(page = 1, limit = 20, search?: string, departmentId?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {
      employment_status: 'ACTIVE',
      ...(departmentId ? { department_id: departmentId } : {}),
      ...(search ? {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { employee_code: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          employee_code: true,
          phone: true,
          department: { select: { department_name: true } },
          manager: { select: { first_name: true, last_name: true } },
          user: { select: { email: true, role: { select: { role_name: true } } } },
        },
        orderBy: { first_name: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);
    return { employees, total, page, limit };
  }

  // ── Job Postings ───────────────────────────────────────────────────────────
  async getJobPostings(isInternal = true, status = 'OPEN') {
    return prisma.jobPosting.findMany({
      where: { is_internal: isInternal, status },
      include: { department: { select: { department_name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async getJobPostingById(id: string) {
    const posting = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        department: { select: { department_name: true } },
        applications: { select: { id: true, status: true, applied_at: true } },
      },
    });
    if (!posting) throw new AppError('Job posting not found', 404);
    return posting;
  }

  async createJobPosting(postedBy: string, data: {
    title: string;
    departmentId?: string;
    description?: string;
    requirements?: string;
    location?: string;
    employmentType?: string;
    isInternal?: boolean;
    salaryRange?: string;
    closingDate?: string;
  }) {
    return prisma.jobPosting.create({
      data: {
        title: data.title,
        department_id: data.departmentId,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        employment_type: data.employmentType || 'FULL_TIME',
        is_internal: data.isInternal !== false,
        posted_by: postedBy,
        salary_range: data.salaryRange,
        closing_date: data.closingDate ? new Date(data.closingDate) : undefined,
      },
    });
  }

  async updateJobPosting(id: string, data: { status?: string; description?: string; closingDate?: string }) {
    const posting = await prisma.jobPosting.findUnique({ where: { id } });
    if (!posting) throw new AppError('Job posting not found', 404);
    return prisma.jobPosting.update({
      where: { id },
      data: {
        status: data.status,
        description: data.description,
        closing_date: data.closingDate ? new Date(data.closingDate) : undefined,
      },
    });
  }

  // ── Job Applications ───────────────────────────────────────────────────────
  async applyToJob(employeeId: string, jobPostingId: string, coverNote?: string) {
    const posting = await prisma.jobPosting.findUnique({ where: { id: jobPostingId } });
    if (!posting || posting.status !== 'OPEN') throw new AppError('Job posting not available', 400);
    return prisma.jobApplication.create({
      data: { employee_id: employeeId, job_posting_id: jobPostingId, cover_note: coverNote },
    });
  }

  async getMyApplications(employeeId: string) {
    return prisma.jobApplication.findMany({
      where: { employee_id: employeeId },
      include: { job_posting: { include: { department: true } } },
      orderBy: { applied_at: 'desc' },
    });
  }

  async getApplicationsForPosting(jobPostingId: string) {
    return prisma.jobApplication.findMany({
      where: { job_posting_id: jobPostingId },
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
        },
      },
      orderBy: { applied_at: 'asc' },
    });
  }

  async updateApplicationStatus(id: string, status: string) {
    const app = await prisma.jobApplication.findUnique({ where: { id } });
    if (!app) throw new AppError('Application not found', 404);
    return prisma.jobApplication.update({ where: { id }, data: { status } });
  }
}

export default new OrgService();
