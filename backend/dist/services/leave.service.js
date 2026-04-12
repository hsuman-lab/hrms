"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
const getWorkingDays = (start, end) => {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6)
            count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
};
class LeaveService {
    async applyLeave(employeeId, data) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (start > end)
            throw new errorHandler_1.AppError('Start date must be before end date', 400);
        const totalDays = getWorkingDays(start, end);
        const balance = await database_1.default.leaveBalance.findUnique({
            where: { employee_id_leave_type_id: { employee_id: employeeId, leave_type_id: data.leaveTypeId } },
        });
        if (!balance)
            throw new errorHandler_1.AppError('Leave type not configured for this employee', 400);
        if ((balance.remaining_days ?? 0) < totalDays) {
            throw new errorHandler_1.AppError(`Insufficient leave balance. Available: ${balance.remaining_days} days`, 400);
        }
        // Check for overlapping requests
        const overlap = await database_1.default.leaveRequest.findFirst({
            where: {
                employee_id: employeeId,
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [
                    { start_date: { lte: end }, end_date: { gte: start } },
                ],
            },
        });
        if (overlap)
            throw new errorHandler_1.AppError('You have an overlapping leave request', 400);
        return database_1.default.leaveRequest.create({
            data: {
                employee_id: employeeId,
                leave_type_id: data.leaveTypeId,
                start_date: start,
                end_date: end,
                total_days: totalDays,
                reason: data.reason,
                status: 'PENDING',
            },
            include: { leave_type: true },
        });
    }
    async getMyLeaves(employeeId, status) {
        return database_1.default.leaveRequest.findMany({
            where: {
                employee_id: employeeId,
                ...(status && { status }),
            },
            include: {
                leave_type: true,
                approvals: {
                    include: { approver: { select: { first_name: true, last_name: true } } },
                },
            },
            orderBy: { applied_at: 'desc' },
        });
    }
    async getLeaveBalance(employeeId) {
        return database_1.default.leaveBalance.findMany({
            where: { employee_id: employeeId },
            include: { leave_type: true },
        });
    }
    async getPendingApprovalsForManager(managerId) {
        const team = await database_1.default.employee.findMany({
            where: { manager_id: managerId },
            select: { id: true },
        });
        const teamIds = team.map((e) => e.id);
        return database_1.default.leaveRequest.findMany({
            where: { employee_id: { in: teamIds }, status: 'PENDING' },
            include: {
                employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: true } },
                leave_type: true,
            },
            orderBy: { applied_at: 'asc' },
        });
    }
    async approveOrRejectLeave(leaveRequestId, approverId, status, remarks) {
        const request = await database_1.default.leaveRequest.findUnique({
            where: { id: leaveRequestId },
            include: { leave_type: true },
        });
        if (!request)
            throw new errorHandler_1.AppError('Leave request not found', 404);
        if (request.status !== 'PENDING')
            throw new errorHandler_1.AppError('Leave request is no longer pending', 400);
        await database_1.default.$transaction(async (tx) => {
            await tx.leaveRequest.update({ where: { id: leaveRequestId }, data: { status } });
            await tx.leaveApproval.create({
                data: {
                    leave_request_id: leaveRequestId,
                    approver_id: approverId,
                    approval_status: status,
                    remarks,
                    approved_at: new Date(),
                },
            });
            if (status === 'APPROVED') {
                await tx.leaveBalance.update({
                    where: {
                        employee_id_leave_type_id: {
                            employee_id: request.employee_id,
                            leave_type_id: request.leave_type_id,
                        },
                    },
                    data: {
                        used_days: { increment: request.total_days ?? 0 },
                        remaining_days: { decrement: request.total_days ?? 0 },
                    },
                });
            }
        });
        return { success: true, message: `Leave ${status.toLowerCase()} successfully` };
    }
    async getAllLeaveTypes() {
        return database_1.default.leaveType.findMany({ orderBy: { leave_name: 'asc' } });
    }
    async createLeaveType(data) {
        const leaveType = await database_1.default.leaveType.create({
            data: {
                leave_name: data.leaveName,
                description: data.description,
                max_days: data.maxDays,
                is_paid: data.isPaid,
                carry_forward: data.carryForward,
                created_by: data.createdBy,
            },
        });
        // Initialize balance for all existing employees
        const employees = await database_1.default.employee.findMany({ select: { id: true } });
        await database_1.default.leaveBalance.createMany({
            data: employees.map((emp) => ({
                employee_id: emp.id,
                leave_type_id: leaveType.id,
                total_days: data.maxDays,
                used_days: 0,
                remaining_days: data.maxDays,
            })),
            skipDuplicates: true,
        });
        return leaveType;
    }
    async updateLeaveType(id, data) {
        return database_1.default.leaveType.update({
            where: { id },
            data: {
                leave_name: data.leaveName,
                description: data.description,
                max_days: data.maxDays,
                is_paid: data.isPaid,
                carry_forward: data.carryForward,
            },
        });
    }
    async getAllLeavesForHR(status, month, year) {
        const where = {};
        if (status)
            where.status = status;
        if (month && year) {
            where.applied_at = {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0),
            };
        }
        return database_1.default.leaveRequest.findMany({
            where,
            include: {
                employee: {
                    select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
                },
                leave_type: true,
                approvals: {
                    include: { approver: { select: { first_name: true, last_name: true } } },
                },
            },
            orderBy: { applied_at: 'desc' },
        });
    }
}
exports.LeaveService = LeaveService;
exports.default = new LeaveService();
//# sourceMappingURL=leave.service.js.map