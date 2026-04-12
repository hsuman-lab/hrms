"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class OffboardingService {
    // ── Resignation ────────────────────────────────────────────────────────────
    async getMyResignation(employeeId) {
        return database_1.default.resignation.findUnique({
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
    async submitResignation(employeeId, data) {
        const existing = await database_1.default.resignation.findUnique({ where: { employee_id: employeeId } });
        if (existing && existing.status !== 'WITHDRAWN') {
            throw new errorHandler_1.AppError('Resignation already submitted', 400);
        }
        const employee = await database_1.default.employee.findUnique({ where: { id: employeeId } });
        if (!employee)
            throw new errorHandler_1.AppError('Employee not found', 404);
        const resignation = await database_1.default.resignation.upsert({
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
            await database_1.default.resignationApproval.upsert({
                where: {
                    // Use raw query workaround — create if none exists
                    id: (await database_1.default.resignationApproval.findFirst({
                        where: { resignation_id: resignation.id, approver_id: employee.manager_id },
                    }))?.id || 'new',
                },
                update: { status: 'PENDING', approved_at: null, remarks: null },
                create: {
                    resignation_id: resignation.id,
                    approver_id: employee.manager_id,
                    status: 'PENDING',
                },
            }).catch(async () => {
                // If upsert fails due to 'new' not existing, just create
                await database_1.default.resignationApproval.create({
                    data: {
                        resignation_id: resignation.id,
                        approver_id: employee.manager_id,
                        status: 'PENDING',
                    },
                });
            });
        }
        return resignation;
    }
    async withdrawResignation(employeeId) {
        const resignation = await database_1.default.resignation.findUnique({ where: { employee_id: employeeId } });
        if (!resignation)
            throw new errorHandler_1.AppError('No resignation found', 404);
        if (resignation.status === 'APPROVED')
            throw new errorHandler_1.AppError('Cannot withdraw an approved resignation', 400);
        return database_1.default.resignation.update({
            where: { employee_id: employeeId },
            data: { status: 'WITHDRAWN' },
        });
    }
    // ── Manager: Approve / Reject Resignation ──────────────────────────────────
    async getPendingResignations(managerId) {
        return database_1.default.resignationApproval.findMany({
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
    async actionResignation(approvalId, managerId, status, remarks) {
        const approval = await database_1.default.resignationApproval.findUnique({ where: { id: approvalId } });
        if (!approval || approval.approver_id !== managerId)
            throw new errorHandler_1.AppError('Approval not found', 404);
        await database_1.default.$transaction(async (tx) => {
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
    async getExitInterview(employeeId) {
        return database_1.default.exitInterview.findUnique({ where: { employee_id: employeeId } });
    }
    async submitExitInterview(employeeId, data) {
        const resignation = await database_1.default.resignation.findUnique({ where: { employee_id: employeeId } });
        if (!resignation)
            throw new errorHandler_1.AppError('No resignation found for this employee', 404);
        return database_1.default.exitInterview.upsert({
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
    async getFnFSettlement(employeeId) {
        return database_1.default.fnFSettlement.findUnique({ where: { employee_id: employeeId } });
    }
    async upsertFnFSettlement(employeeId, data) {
        const resignation = await database_1.default.resignation.findUnique({ where: { employee_id: employeeId } });
        if (!resignation)
            throw new errorHandler_1.AppError('No resignation found', 404);
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
        return database_1.default.fnFSettlement.upsert({
            where: { employee_id: employeeId },
            update: payload,
            create: { employee_id: employeeId, resignation_id: resignation.id, ...payload },
        });
    }
    // ── Offboarding Tasks ──────────────────────────────────────────────────────
    async getMyOffboardingChecklist(employeeId) {
        return database_1.default.offboardingChecklist.findMany({
            where: { employee_id: employeeId },
            include: { task: true },
        });
    }
    async bootstrapOffboardingChecklist(employeeId) {
        const tasks = await database_1.default.offboardingTask.findMany();
        const data = tasks.map((t) => ({ employee_id: employeeId, task_id: t.id }));
        await database_1.default.offboardingChecklist.createMany({ data, skipDuplicates: true });
        return database_1.default.offboardingChecklist.findMany({
            where: { employee_id: employeeId },
            include: { task: true },
        });
    }
    async updateOffboardingItem(id, employeeId, data) {
        const item = await database_1.default.offboardingChecklist.findUnique({ where: { id } });
        if (!item || item.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Checklist item not found', 404);
        return database_1.default.offboardingChecklist.update({
            where: { id },
            data: {
                status: data.status,
                remarks: data.remarks,
                completed_at: data.status === 'COMPLETED' ? new Date() : undefined,
            },
        });
    }
}
exports.OffboardingService = OffboardingService;
exports.default = new OffboardingService();
//# sourceMappingURL=offboarding.service.js.map