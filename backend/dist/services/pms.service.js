"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmsService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class PmsService {
    // ── Goals ──────────────────────────────────────────────────────────────────
    async getMyGoals(employeeId, period) {
        return database_1.default.performanceGoal.findMany({
            where: { employee_id: employeeId, ...(period ? { review_period: period } : {}) },
            orderBy: { created_at: 'desc' },
        });
    }
    async getTeamGoals(managerId, period) {
        const team = await database_1.default.employee.findMany({ where: { manager_id: managerId }, select: { id: true } });
        const ids = team.map((e) => e.id);
        return database_1.default.performanceGoal.findMany({
            where: { employee_id: { in: ids }, ...(period ? { review_period: period } : {}) },
            include: { employee: { select: { first_name: true, last_name: true, employee_code: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async createGoal(employeeId, data) {
        return database_1.default.performanceGoal.create({
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
    async updateGoal(id, employeeId, data) {
        const goal = await database_1.default.performanceGoal.findUnique({ where: { id } });
        if (!goal || goal.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Goal not found', 404);
        return database_1.default.performanceGoal.update({
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
    async getMySelfAssessments(employeeId) {
        return database_1.default.selfAssessment.findMany({
            where: { employee_id: employeeId },
            include: { manager_review: true },
            orderBy: { created_at: 'desc' },
        });
    }
    async upsertSelfAssessment(employeeId, data) {
        const existing = await database_1.default.selfAssessment.findUnique({
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
            if (existing.status === 'SUBMITTED')
                throw new errorHandler_1.AppError('Self assessment already submitted', 400);
            return database_1.default.selfAssessment.update({ where: { id: existing.id }, data: payload });
        }
        return database_1.default.selfAssessment.create({
            data: { employee_id: employeeId, review_period: data.reviewPeriod, ...payload },
        });
    }
    // ── Manager Reviews ────────────────────────────────────────────────────────
    async getPendingReviews(managerId) {
        const team = await database_1.default.employee.findMany({ where: { manager_id: managerId }, select: { id: true } });
        const ids = team.map((e) => e.id);
        return database_1.default.selfAssessment.findMany({
            where: { employee_id: { in: ids }, status: 'SUBMITTED' },
            include: {
                employee: { select: { first_name: true, last_name: true, employee_code: true } },
                manager_review: true,
            },
        });
    }
    async submitManagerReview(managerId, selfAssessmentId, data) {
        const sa = await database_1.default.selfAssessment.findUnique({
            where: { id: selfAssessmentId },
            include: { employee: { select: { manager_id: true } } },
        });
        if (!sa)
            throw new errorHandler_1.AppError('Self assessment not found', 404);
        if (sa.employee.manager_id !== managerId)
            throw new errorHandler_1.AppError('Only reporting manager can review', 403);
        const existing = await database_1.default.managerReview.findUnique({ where: { self_assessment_id: selfAssessmentId } });
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
            return database_1.default.managerReview.update({ where: { id: existing.id }, data: payload });
        }
        return database_1.default.managerReview.create({
            data: { self_assessment_id: selfAssessmentId, ...payload },
        });
    }
    // ── 360 Feedback ───────────────────────────────────────────────────────────
    async getFeedbackReceived(employeeId) {
        return database_1.default.feedback360.findMany({
            where: { receiver_id: employeeId },
            include: {
                giver: { select: { first_name: true, last_name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async submitFeedback(giverId, data) {
        return database_1.default.feedback360.create({
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
    async getSkills(employeeId) {
        return database_1.default.employeeSkill.findMany({ where: { employee_id: employeeId } });
    }
    async addSkill(employeeId, data) {
        return database_1.default.employeeSkill.upsert({
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
    async deleteSkill(id, employeeId) {
        const skill = await database_1.default.employeeSkill.findUnique({ where: { id } });
        if (!skill || skill.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Skill not found', 404);
        await database_1.default.employeeSkill.delete({ where: { id } });
        return { success: true };
    }
    // ── Skill Development Plans ────────────────────────────────────────────────
    async getSkillPlans(employeeId) {
        return database_1.default.skillDevelopmentPlan.findMany({ where: { employee_id: employeeId } });
    }
    async createSkillPlan(employeeId, data) {
        return database_1.default.skillDevelopmentPlan.create({
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
    async updateSkillPlan(id, employeeId, data) {
        const plan = await database_1.default.skillDevelopmentPlan.findUnique({ where: { id } });
        if (!plan || plan.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Skill plan not found', 404);
        return database_1.default.skillDevelopmentPlan.update({
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
exports.PmsService = PmsService;
exports.default = new PmsService();
//# sourceMappingURL=pms.service.js.map