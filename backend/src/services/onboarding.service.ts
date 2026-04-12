import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class OnboardingService {
  // ── Tasks Master ───────────────────────────────────────────────────────────
  async getMasterTasks() {
    return prisma.onboardingTask.findMany({ orderBy: { created_at: 'asc' } });
  }

  async createMasterTask(data: {
    taskTitle: string;
    description?: string;
    category?: string;
    isMandatory?: boolean;
    dueDays?: number;
  }) {
    return prisma.onboardingTask.create({
      data: {
        task_title: data.taskTitle,
        description: data.description,
        category: data.category || 'GENERAL',
        is_mandatory: data.isMandatory !== false,
        due_days: data.dueDays,
      },
    });
  }

  // ── Employee Checklist ─────────────────────────────────────────────────────
  async getMyChecklist(employeeId: string) {
    return prisma.onboardingChecklist.findMany({
      where: { employee_id: employeeId },
      include: { task: true },
      orderBy: { task: { created_at: 'asc' } },
    });
  }

  /** HR/Admin: bootstrap checklist for new employee from all master tasks */
  async bootstrapChecklist(employeeId: string) {
    const tasks = await prisma.onboardingTask.findMany();
    const data = tasks.map((t) => ({ employee_id: employeeId, task_id: t.id }));
    await prisma.onboardingChecklist.createMany({ data, skipDuplicates: true });
    return prisma.onboardingChecklist.findMany({
      where: { employee_id: employeeId },
      include: { task: true },
    });
  }

  async updateChecklistItem(id: string, employeeId: string, data: { status: string; remarks?: string }) {
    const item = await prisma.onboardingChecklist.findUnique({ where: { id } });
    if (!item || item.employee_id !== employeeId) throw new AppError('Checklist item not found', 404);
    return prisma.onboardingChecklist.update({
      where: { id },
      data: {
        status: data.status,
        remarks: data.remarks,
        completed_at: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  // ── Policy Acknowledgements ────────────────────────────────────────────────
  async getPolicies(employeeId: string) {
    return prisma.policyAcknowledgement.findMany({ where: { employee_id: employeeId } });
  }

  async acknowledgePolicy(employeeId: string, data: {
    policyName: string;
    policyVersion?: string;
    ipAddress?: string;
  }) {
    return prisma.policyAcknowledgement.upsert({
      where: {
        employee_id_policy_name_policy_version: {
          employee_id: employeeId,
          policy_name: data.policyName,
          policy_version: data.policyVersion || '1.0',
        },
      },
      update: { acknowledged_at: new Date() },
      create: {
        employee_id: employeeId,
        policy_name: data.policyName,
        policy_version: data.policyVersion || '1.0',
        ip_address: data.ipAddress,
      },
    });
  }

  // ── Onboarding Experience / Rating ─────────────────────────────────────────
  async getExperience(employeeId: string) {
    return prisma.onboardingExperience.findUnique({ where: { employee_id: employeeId } });
  }

  async submitExperience(employeeId: string, data: {
    overallRating?: number;
    buddyRating?: number;
    processRating?: number;
    feedback?: string;
  }) {
    return prisma.onboardingExperience.upsert({
      where: { employee_id: employeeId },
      update: {
        overall_rating: data.overallRating,
        buddy_rating: data.buddyRating,
        process_rating: data.processRating,
        feedback: data.feedback,
        submitted_at: new Date(),
      },
      create: {
        employee_id: employeeId,
        overall_rating: data.overallRating,
        buddy_rating: data.buddyRating,
        process_rating: data.processRating,
        feedback: data.feedback,
        submitted_at: new Date(),
      },
    });
  }
}

export default new OnboardingService();
