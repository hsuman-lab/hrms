"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class OnboardingService {
    // ── Tasks Master ───────────────────────────────────────────────────────────
    async getMasterTasks() {
        return database_1.default.onboardingTask.findMany({ orderBy: { created_at: 'asc' } });
    }
    async createMasterTask(data) {
        return database_1.default.onboardingTask.create({
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
    async getMyChecklist(employeeId) {
        return database_1.default.onboardingChecklist.findMany({
            where: { employee_id: employeeId },
            include: { task: true },
            orderBy: { task: { created_at: 'asc' } },
        });
    }
    /** HR/Admin: bootstrap checklist for new employee from all master tasks */
    async bootstrapChecklist(employeeId) {
        const tasks = await database_1.default.onboardingTask.findMany();
        const data = tasks.map((t) => ({ employee_id: employeeId, task_id: t.id }));
        await database_1.default.onboardingChecklist.createMany({ data, skipDuplicates: true });
        return database_1.default.onboardingChecklist.findMany({
            where: { employee_id: employeeId },
            include: { task: true },
        });
    }
    async updateChecklistItem(id, employeeId, data) {
        const item = await database_1.default.onboardingChecklist.findUnique({ where: { id } });
        if (!item || item.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Checklist item not found', 404);
        return database_1.default.onboardingChecklist.update({
            where: { id },
            data: {
                status: data.status,
                remarks: data.remarks,
                completed_at: data.status === 'COMPLETED' ? new Date() : undefined,
            },
        });
    }
    // ── Policy Acknowledgements ────────────────────────────────────────────────
    async getPolicies(employeeId) {
        return database_1.default.policyAcknowledgement.findMany({ where: { employee_id: employeeId } });
    }
    async acknowledgePolicy(employeeId, data) {
        return database_1.default.policyAcknowledgement.upsert({
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
    async getExperience(employeeId) {
        return database_1.default.onboardingExperience.findUnique({ where: { employee_id: employeeId } });
    }
    async submitExperience(employeeId, data) {
        return database_1.default.onboardingExperience.upsert({
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
exports.OnboardingService = OnboardingService;
exports.default = new OnboardingService();
//# sourceMappingURL=onboarding.service.js.map