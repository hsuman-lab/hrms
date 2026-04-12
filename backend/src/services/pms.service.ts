import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class PmsService {
  // ── Goals ──────────────────────────────────────────────────────────────────
  async getMyGoals(employeeId: string, period?: string) {
    return prisma.performanceGoal.findMany({
      where: { employee_id: employeeId, ...(period ? { review_period: period } : {}) },
      orderBy: { created_at: 'desc' },
    });
  }

  async getTeamGoals(managerId: string, period?: string) {
    const team = await prisma.employee.findMany({ where: { manager_id: managerId }, select: { id: true } });
    const ids = team.map((e) => e.id);
    return prisma.performanceGoal.findMany({
      where: { employee_id: { in: ids }, ...(period ? { review_period: period } : {}) },
      include: { employee: { select: { first_name: true, last_name: true, employee_code: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async createGoal(employeeId: string, data: {
    title: string;
    description?: string;
    goalType?: string;
    metricType?: string;
    targetValue?: string;
    weightage?: number;
    dueDate?: string;
    reviewPeriod?: string;
  }) {
    return prisma.performanceGoal.create({
      data: {
        employee_id: employeeId,
        title: data.title,
        description: data.description,
        goal_type: data.goalType || 'INDIVIDUAL',
        metric_type: data.metricType || 'OKR',
        target_value: data.targetValue,
        weightage: data.weightage,
        due_date: data.dueDate ? new Date(data.dueDate) : undefined,
        review_period: data.reviewPeriod,
      },
    });
  }

  async updateGoal(id: string, employeeId: string, data: {
    title?: string;
    description?: string;
    achievedValue?: string;
    progressPct?: number;
    status?: string;
  }) {
    const goal = await prisma.performanceGoal.findUnique({ where: { id } });
    if (!goal || goal.employee_id !== employeeId) throw new AppError('Goal not found', 404);
    return prisma.performanceGoal.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        achieved_value: data.achievedValue,
        progress_pct: data.progressPct,
        status: data.status,
      },
    });
  }

  // ── Self Assessments ───────────────────────────────────────────────────────
  async getMySelfAssessments(employeeId: string) {
    return prisma.selfAssessment.findMany({
      where: { employee_id: employeeId },
      include: { manager_review: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async upsertSelfAssessment(employeeId: string, data: {
    reviewPeriod: string;
    strengths?: string;
    improvements?: string;
    achievements?: string;
    ratingSelf?: number;
    overallComment?: string;
    submit?: boolean;
  }) {
    const existing = await prisma.selfAssessment.findUnique({
      where: { employee_id_review_period: { employee_id: employeeId, review_period: data.reviewPeriod } },
    });
    const payload = {
      strengths: data.strengths,
      improvements: data.improvements,
      achievements: data.achievements,
      rating_self: data.ratingSelf,
      overall_comment: data.overallComment,
      status: data.submit ? 'SUBMITTED' : 'DRAFT',
      submitted_at: data.submit ? new Date() : undefined,
    };
    if (existing) {
      if (existing.status === 'SUBMITTED') throw new AppError('Self assessment already submitted', 400);
      return prisma.selfAssessment.update({ where: { id: existing.id }, data: payload });
    }
    return prisma.selfAssessment.create({
      data: { employee_id: employeeId, review_period: data.reviewPeriod, ...payload },
    });
  }

  // ── Manager Reviews ────────────────────────────────────────────────────────
  async getPendingReviews(managerId: string) {
    const team = await prisma.employee.findMany({ where: { manager_id: managerId }, select: { id: true } });
    const ids = team.map((e) => e.id);
    return prisma.selfAssessment.findMany({
      where: { employee_id: { in: ids }, status: 'SUBMITTED' },
      include: {
        employee: { select: { first_name: true, last_name: true, employee_code: true } },
        manager_review: true,
      },
    });
  }

  async submitManagerReview(managerId: string, selfAssessmentId: string, data: {
    ratingManager?: number;
    strengths?: string;
    improvements?: string;
    overallComment?: string;
    finalRating?: number;
  }) {
    const sa = await prisma.selfAssessment.findUnique({
      where: { id: selfAssessmentId },
      include: { employee: { select: { manager_id: true } } },
    });
    if (!sa) throw new AppError('Self assessment not found', 404);
    if (sa.employee.manager_id !== managerId) throw new AppError('Only reporting manager can review', 403);

    const existing = await prisma.managerReview.findUnique({ where: { self_assessment_id: selfAssessmentId } });
    const payload = {
      reviewee_id: sa.employee_id,
      reviewer_id: managerId,
      review_period: sa.review_period,
      rating_manager: data.ratingManager,
      strengths: data.strengths,
      improvements: data.improvements,
      overall_comment: data.overallComment,
      final_rating: data.finalRating,
      status: 'COMPLETED',
      reviewed_at: new Date(),
    };
    if (existing) {
      return prisma.managerReview.update({ where: { id: existing.id }, data: payload });
    }
    return prisma.managerReview.create({
      data: { self_assessment_id: selfAssessmentId, ...payload },
    });
  }

  // ── 360 Feedback ───────────────────────────────────────────────────────────
  async getFeedbackReceived(employeeId: string) {
    return prisma.feedback360.findMany({
      where: { receiver_id: employeeId },
      include: {
        giver: { select: { first_name: true, last_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async submitFeedback(giverId: string, data: {
    receiverId: string;
    reviewPeriod: string;
    relationship: string;
    strengths?: string;
    improvements?: string;
    rating?: number;
    isAnonymous?: boolean;
  }) {
    return prisma.feedback360.create({
      data: {
        giver_id: giverId,
        receiver_id: data.receiverId,
        review_period: data.reviewPeriod,
        relationship: data.relationship,
        strengths: data.strengths,
        improvements: data.improvements,
        rating: data.rating,
        is_anonymous: data.isAnonymous !== false,
        submitted_at: new Date(),
      },
    });
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  async getSkills(employeeId: string) {
    return prisma.employeeSkill.findMany({ where: { employee_id: employeeId } });
  }

  async addSkill(employeeId: string, data: {
    skillName: string;
    category?: string;
    proficiency?: string;
  }) {
    return prisma.employeeSkill.upsert({
      where: { employee_id_skill_name: { employee_id: employeeId, skill_name: data.skillName } },
      update: { category: data.category, proficiency: data.proficiency },
      create: {
        employee_id: employeeId,
        skill_name: data.skillName,
        category: data.category || 'TECHNICAL',
        proficiency: data.proficiency || 'BEGINNER',
      },
    });
  }

  async deleteSkill(id: string, employeeId: string) {
    const skill = await prisma.employeeSkill.findUnique({ where: { id } });
    if (!skill || skill.employee_id !== employeeId) throw new AppError('Skill not found', 404);
    await prisma.employeeSkill.delete({ where: { id } });
    return { success: true };
  }

  // ── Skill Development Plans ────────────────────────────────────────────────
  async getSkillPlans(employeeId: string) {
    return prisma.skillDevelopmentPlan.findMany({ where: { employee_id: employeeId } });
  }

  async createSkillPlan(employeeId: string, data: {
    skillName: string;
    currentLevel?: string;
    targetLevel?: string;
    actionItems?: string;
    resources?: string;
    targetDate?: string;
  }) {
    return prisma.skillDevelopmentPlan.create({
      data: {
        employee_id: employeeId,
        skill_name: data.skillName,
        current_level: data.currentLevel,
        target_level: data.targetLevel,
        action_items: data.actionItems,
        resources: data.resources,
        target_date: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    });
  }

  async updateSkillPlan(id: string, employeeId: string, data: {
    actionItems?: string;
    resources?: string;
    targetDate?: string;
    status?: string;
  }) {
    const plan = await prisma.skillDevelopmentPlan.findUnique({ where: { id } });
    if (!plan || plan.employee_id !== employeeId) throw new AppError('Skill plan not found', 404);
    return prisma.skillDevelopmentPlan.update({
      where: { id },
      data: {
        action_items: data.actionItems,
        resources: data.resources,
        target_date: data.targetDate ? new Date(data.targetDate) : undefined,
        status: data.status,
      },
    });
  }
}

export default new PmsService();
