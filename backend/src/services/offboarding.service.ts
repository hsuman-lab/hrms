import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class OffboardingService {
  // ── Resignation ────────────────────────────────────────────────────────────
  async getMyResignation(employeeId: string) {
    return prisma.resignation.findUnique({
      where: { employee_id: employeeId },
      include: {
        approvals: {
          include: { approver: { select: { first_name: true, last_name: true } } },
        },
        exit_interview: true,
        fnf_settlement: true,
      },
    });
  }

  async submitResignation(employeeId: string, data: {
    resignationDate: string;
    reason?: string;
    noticePeriodDays?: number;
  }) {
    const existing = await prisma.resignation.findUnique({ where: { employee_id: employeeId } });
    if (existing && existing.status !== 'WITHDRAWN') {
      throw new AppError('Resignation already submitted', 400);
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const resignation = await prisma.resignation.upsert({
      where: { employee_id: employeeId },
      update: {
        resignation_date: new Date(data.resignationDate),
        reason: data.reason,
        notice_period_days: data.noticePeriodDays,
        status: 'PENDING',
        submitted_at: new Date(),
      },
      create: {
        employee_id: employeeId,
        resignation_date: new Date(data.resignationDate),
        reason: data.reason,
        notice_period_days: data.noticePeriodDays,
        status: 'PENDING',
      },
    });

    // Auto-create pending approval record for reporting manager
    if (employee.manager_id) {
      const existingApproval = await prisma.resignationApproval.findFirst({
        where: { resignation_id: resignation.id, approver_id: employee.manager_id },
      });
      if (existingApproval) {
        await prisma.resignationApproval.update({
          where: { id: existingApproval.id },
          data: { status: 'PENDING', approved_at: null, remarks: null },
        });
      } else {
        await prisma.resignationApproval.create({
          data: {
            resignation_id: resignation.id,
            approver_id: employee.manager_id,
            status: 'PENDING',
          },
        });
      }
    }

    return resignation;
  }

  async withdrawResignation(employeeId: string) {
    const resignation = await prisma.resignation.findUnique({ where: { employee_id: employeeId } });
    if (!resignation) throw new AppError('No resignation found', 404);
    if (resignation.status === 'APPROVED') throw new AppError('Cannot withdraw an approved resignation', 400);
    return prisma.resignation.update({
      where: { employee_id: employeeId },
      data: { status: 'WITHDRAWN' },
    });
  }

  // ── Manager: Approve / Reject Resignation ──────────────────────────────────
  async getPendingResignations(managerId: string) {
    return prisma.resignationApproval.findMany({
      where: { approver_id: managerId, status: 'PENDING' },
      include: {
        resignation: {
          include: {
            employee: { select: { first_name: true, last_name: true, employee_code: true, department: true } },
          },
        },
      },
    });
  }

  async actionResignation(approvalId: string, managerId: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    const approval = await prisma.resignationApproval.findUnique({ where: { id: approvalId } });
    if (!approval || approval.approver_id !== managerId) throw new AppError('Approval not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.resignationApproval.update({
        where: { id: approvalId },
        data: { status, remarks, approved_at: new Date() },
      });
      await tx.resignation.update({
        where: { id: approval.resignation_id },
        data: { status },
      });
    });
    return { success: true, status };
  }

  // ── Exit Interview ─────────────────────────────────────────────────────────
  async getExitInterview(employeeId: string) {
    return prisma.exitInterview.findUnique({ where: { employee_id: employeeId } });
  }

  async submitExitInterview(employeeId: string, data: {
    reasonLeaving?: string;
    jobSatisfaction?: number;
    managerRating?: number;
    cultureRating?: number;
    rehireEligible?: boolean;
    suggestions?: string;
    conductedBy?: string;
  }) {
    const resignation = await prisma.resignation.findUnique({ where: { employee_id: employeeId } });
    if (!resignation) throw new AppError('No resignation found for this employee', 404);

    return prisma.exitInterview.upsert({
      where: { employee_id: employeeId },
      update: {
        reason_leaving: data.reasonLeaving,
        job_satisfaction: data.jobSatisfaction,
        manager_rating: data.managerRating,
        culture_rating: data.cultureRating,
        rehire_eligible: data.rehireEligible !== false,
        suggestions: data.suggestions,
        conducted_by: data.conductedBy,
        conducted_at: new Date(),
      },
      create: {
        employee_id: employeeId,
        resignation_id: resignation.id,
        reason_leaving: data.reasonLeaving,
        job_satisfaction: data.jobSatisfaction,
        manager_rating: data.managerRating,
        culture_rating: data.cultureRating,
        rehire_eligible: data.rehireEligible !== false,
        suggestions: data.suggestions,
        conducted_by: data.conductedBy,
        conducted_at: new Date(),
      },
    });
  }

  // ── F&F Settlement ─────────────────────────────────────────────────────────
  async getFnFSettlement(employeeId: string) {
    return prisma.fnFSettlement.findUnique({ where: { employee_id: employeeId } });
  }

  async upsertFnFSettlement(employeeId: string, data: {
    gratuity?: number;
    leaveEncashment?: number;
    bonus?: number;
    deductions?: number;
    netPayable?: number;
    paymentDate?: string;
    status?: string;
    remarks?: string;
  }) {
    const resignation = await prisma.resignation.findUnique({ where: { employee_id: employeeId } });
    if (!resignation) throw new AppError('No resignation found', 404);

    const payload = {
      gratuity: data.gratuity,
      leave_encashment: data.leaveEncashment,
      bonus: data.bonus,
      deductions: data.deductions,
      net_payable: data.netPayable,
      payment_date: data.paymentDate ? new Date(data.paymentDate) : undefined,
      status: data.status || 'PENDING',
      remarks: data.remarks,
    };

    return prisma.fnFSettlement.upsert({
      where: { employee_id: employeeId },
      update: payload,
      create: { employee_id: employeeId, resignation_id: resignation.id, ...payload },
    });
  }

  // ── Offboarding Tasks ──────────────────────────────────────────────────────
  async getMyOffboardingChecklist(employeeId: string) {
    return prisma.offboardingChecklist.findMany({
      where: { employee_id: employeeId },
      include: { task: true },
    });
  }

  async bootstrapOffboardingChecklist(employeeId: string) {
    const tasks = await prisma.offboardingTask.findMany();
    const data = tasks.map((t) => ({ employee_id: employeeId, task_id: t.id }));
    await prisma.offboardingChecklist.createMany({ data, skipDuplicates: true });
    return prisma.offboardingChecklist.findMany({
      where: { employee_id: employeeId },
      include: { task: true },
    });
  }

  async updateOffboardingItem(id: string, employeeId: string, data: { status: string; remarks?: string }) {
    const item = await prisma.offboardingChecklist.findUnique({ where: { id } });
    if (!item || item.employee_id !== employeeId) throw new AppError('Checklist item not found', 404);
    return prisma.offboardingChecklist.update({
      where: { id },
      data: {
        status: data.status,
        remarks: data.remarks,
        completed_at: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }
}

export default new OffboardingService();
