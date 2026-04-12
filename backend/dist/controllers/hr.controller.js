"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRController = void 0;
const zod_1 = require("zod");
const hr_service_1 = __importDefault(require("../services/hr.service"));
const audit_1 = require("../utils/audit");
const deptSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
class HRController {
    async getDepartments(req, res, next) {
        try {
            const depts = await hr_service_1.default.getAllDepartments();
            res.json({ success: true, data: depts });
        }
        catch (err) {
            next(err);
        }
    }
    async createDepartment(req, res, next) {
        try {
            const { name, description } = deptSchema.parse(req.body);
            const dept = await hr_service_1.default.createDepartment(name, description);
            await (0, audit_1.logAudit)(req.user?.userId, 'CREATE_DEPARTMENT', 'Department', dept.id);
            res.status(201).json({ success: true, data: dept });
        }
        catch (err) {
            next(err);
        }
    }
    async updateDepartment(req, res, next) {
        try {
            const { name, description } = deptSchema.partial().parse(req.body);
            const dept = await hr_service_1.default.updateDepartment(req.params.id, name, description);
            res.json({ success: true, data: dept });
        }
        catch (err) {
            next(err);
        }
    }
    async deleteDepartment(req, res, next) {
        try {
            await hr_service_1.default.deleteDepartment(req.params.id);
            await (0, audit_1.logAudit)(req.user?.userId, 'DELETE_DEPARTMENT', 'Department', req.params.id);
            res.json({ success: true, message: 'Department deleted' });
        }
        catch (err) {
            next(err);
        }
    }
    async getRoles(req, res, next) {
        try {
            const roles = await hr_service_1.default.getAllRoles();
            res.json({ success: true, data: roles });
        }
        catch (err) {
            next(err);
        }
    }
    async getAnalytics(req, res, next) {
        try {
            const analytics = await hr_service_1.default.getOrgAnalytics();
            res.json({ success: true, data: analytics });
        }
        catch (err) {
            next(err);
        }
    }
    async updateUserRole(req, res, next) {
        try {
            const { roleId } = zod_1.z.object({ roleId: zod_1.z.string().min(1) }).parse(req.body);
            await hr_service_1.default.updateUserRole(req.params.userId, roleId);
            res.json({ success: true, message: 'Role updated' });
        }
        catch (err) {
            next(err);
        }
    }
    async toggleUserStatus(req, res, next) {
        try {
            const user = await hr_service_1.default.toggleUserStatus(req.params.userId);
            res.json({ success: true, data: { is_active: user.is_active } });
        }
        catch (err) {
            next(err);
        }
    }
    async getAuditLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await hr_service_1.default.getAuditLogs(page, limit);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.HRController = HRController;
exports.default = new HRController();
//# sourceMappingURL=hr.controller.js.map