"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReimbursementService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class ReimbursementService {
    async apply(employeeId, data) {
        return database_1.default.reimbursement.create({
            data: {
                employee_id: employeeId,
                category: data.category,
                amount: data.amount,
                description: data.description,
                bill_date: new Date(data.billDate),
                status: 'PENDING',
            },
            include: { employee: { select: { first_name: true, last_name: true, employee_code: true } } },
        });
    }
    async getMyReimbursements(employeeId) {
        return database_1.default.reimbursement.findMany({
            where: { employee_id: employeeId },
            include: {
                approvals: {
                    include: { approver: { select: { first_name: true, last_name: true } } },
                },
            },
            orderBy: { applied_at: 'desc' },
        });
    }
    /** Pending reimbursements for direct reports of the manager */
    async getPendingForManager(managerId) {
        const team = await database_1.default.employee.findMany({
            where: { manager_id: managerId },
            select: { id: true },
        });
        const ids = team.map((e) => e.id);
        return database_1.default.reimbursement.findMany({
            where: { employee_id: { in: ids }, status: 'PENDING' },
            include: {
                employee: {
                    select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
                },
            },
            orderBy: { applied_at: 'asc' },
        });
    }
    async approveOrReject(reimbursementId, approverId, status, remarks) {
        const req = await database_1.default.reimbursement.findUnique({ where: { id: reimbursementId } });
        if (!req)
            throw new errorHandler_1.AppError('Reimbursement not found', 404);
        if (req.status !== 'PENDING')
            throw new errorHandler_1.AppError('Reimbursement is no longer pending', 400);
        // Verify approver is actually the reporting manager
        const employee = await database_1.default.employee.findUnique({
            where: { id: req.employee_id },
            select: { manager_id: true },
        });
        if (employee?.manager_id !== approverId) {
            throw new errorHandler_1.AppError('Only the reporting manager can approve this reimbursement', 403);
        }
        await database_1.default.$transaction(async (tx) => {
            await tx.reimbursement.update({ where: { id: reimbursementId }, data: { status } });
            await tx.reimbursementApproval.create({
                data: {
                    reimbursement_id: reimbursementId,
                    approver_id: approverId,
                    approval_status: status,
                    remarks,
                    approved_at: new Date(),
                },
            });
        });
        return { success: true, message: `Reimbursement ${status.toLowerCase()} successfully` };
    }
    /** HR: all reimbursements */
    async getAllForHR(status) {
        return database_1.default.reimbursement.findMany({
            where: status ? { status } : undefined,
            include: {
                employee: {
                    select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
                },
                approvals: {
                    include: { approver: { select: { first_name: true, last_name: true } } },
                },
            },
            orderBy: { applied_at: 'desc' },
        });
    }
}
exports.ReimbursementService = ReimbursementService;
exports.default = new ReimbursementService();
//# sourceMappingURL=reimbursement.service.js.map