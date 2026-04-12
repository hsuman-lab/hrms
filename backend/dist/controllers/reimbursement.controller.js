"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReimbursementController = void 0;
const zod_1 = require("zod");
const reimbursement_service_1 = __importDefault(require("../services/reimbursement.service"));
const audit_1 = require("../utils/audit");
const CATEGORIES = ['TRAVEL', 'FOOD', 'MEDICAL', 'ACCOMMODATION', 'OTHER'];
const applySchema = zod_1.z.object({
    category: zod_1.z.enum(CATEGORIES),
    amount: zod_1.z.number().positive(),
    description: zod_1.z.string().min(5),
    billDate: zod_1.z.string(),
});
const actionSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    remarks: zod_1.z.string().optional(),
});
class ReimbursementController {
    async apply(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            const data = applySchema.parse(req.body);
            const result = await reimbursement_service_1.default.apply(req.user.employeeId, data);
            await (0, audit_1.logAudit)(req.user.userId, 'APPLY_REIMBURSEMENT', 'Reimbursement', result.id);
            res.status(201).json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getMine(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            const result = await reimbursement_service_1.default.getMyReimbursements(req.user.employeeId);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getPendingForManager(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            const result = await reimbursement_service_1.default.getPendingForManager(req.user.employeeId);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async action(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.status(400).json({ success: false, error: 'No employee record' });
                return;
            }
            const { status, remarks } = actionSchema.parse(req.body);
            const result = await reimbursement_service_1.default.approveOrReject(req.params.id, req.user.employeeId, status, remarks);
            await (0, audit_1.logAudit)(req.user.userId, `REIMBURSEMENT_${status}`, 'Reimbursement', req.params.id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getAllHR(req, res, next) {
        try {
            const status = req.query.status;
            const result = await reimbursement_service_1.default.getAllForHR(status);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ReimbursementController = ReimbursementController;
exports.default = new ReimbursementController();
//# sourceMappingURL=reimbursement.controller.js.map