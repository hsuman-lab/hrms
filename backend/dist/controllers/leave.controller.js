"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveController = void 0;
const zod_1 = require("zod");
const leave_service_1 = __importDefault(require("../services/leave.service"));
const audit_1 = require("../utils/audit");
const applyLeaveSchema = zod_1.z.object({
    leaveTypeId: zod_1.z.string().min(1),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    reason: zod_1.z.string().optional(),
});
const approvalSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    remarks: zod_1.z.string().optional(),
});
const leaveTypeSchema = zod_1.z.object({
    leaveName: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    maxDays: zod_1.z.number().positive(),
    isPaid: zod_1.z.boolean(),
    carryForward: zod_1.z.boolean(),
});
class LeaveController {
    async apply(req, res, next) {
        try {
            const data = applyLeaveSchema.parse(req.body);
            const request = await leave_service_1.default.applyLeave(req.user.employeeId, data);
            await (0, audit_1.logAudit)(req.user?.userId, 'APPLY_LEAVE', 'LeaveRequest', request.id);
            res.status(201).json({ success: true, data: request });
        }
        catch (err) {
            next(err);
        }
    }
    async getMyLeaves(req, res, next) {
        try {
            const status = req.query.status;
            const leaves = await leave_service_1.default.getMyLeaves(req.user.employeeId, status);
            res.json({ success: true, data: leaves });
        }
        catch (err) {
            next(err);
        }
    }
    async getBalance(req, res, next) {
        try {
            const balances = await leave_service_1.default.getLeaveBalance(req.user.employeeId);
            res.json({ success: true, data: balances });
        }
        catch (err) {
            next(err);
        }
    }
    async getPendingApprovals(req, res, next) {
        try {
            const managerId = req.user.employeeId;
            const requests = await leave_service_1.default.getPendingApprovalsForManager(managerId);
            res.json({ success: true, data: requests });
        }
        catch (err) {
            next(err);
        }
    }
    async approve(req, res, next) {
        try {
            const { status, remarks } = approvalSchema.parse(req.body);
            const result = await leave_service_1.default.approveOrRejectLeave(req.params.id, req.user.employeeId, status, remarks);
            await (0, audit_1.logAudit)(req.user?.userId, `LEAVE_${status}`, 'LeaveRequest', req.params.id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getLeaveTypes(req, res, next) {
        try {
            const types = await leave_service_1.default.getAllLeaveTypes();
            res.json({ success: true, data: types });
        }
        catch (err) {
            next(err);
        }
    }
    async createLeaveType(req, res, next) {
        try {
            const data = leaveTypeSchema.parse(req.body);
            const leaveType = await leave_service_1.default.createLeaveType({ ...data, createdBy: req.user.userId });
            await (0, audit_1.logAudit)(req.user?.userId, 'CREATE_LEAVE_TYPE', 'LeaveType', leaveType.id);
            res.status(201).json({ success: true, data: leaveType });
        }
        catch (err) {
            next(err);
        }
    }
    async updateLeaveType(req, res, next) {
        try {
            const data = leaveTypeSchema.partial().parse(req.body);
            const leaveType = await leave_service_1.default.updateLeaveType(req.params.id, {
                leaveName: data.leaveName,
                description: data.description,
                maxDays: data.maxDays,
                isPaid: data.isPaid,
                carryForward: data.carryForward,
            });
            res.json({ success: true, data: leaveType });
        }
        catch (err) {
            next(err);
        }
    }
    async getAllLeavesHR(req, res, next) {
        try {
            const { status, month, year } = req.query;
            const leaves = await leave_service_1.default.getAllLeavesForHR(status, month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
            res.json({ success: true, data: leaves });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.LeaveController = LeaveController;
exports.default = new LeaveController();
//# sourceMappingURL=leave.controller.js.map