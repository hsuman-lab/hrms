"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class HRService {
    async getAllDepartments() {
        return database_1.default.department.findMany({
            include: { _count: { select: { employees: true } } },
            orderBy: { department_name: 'asc' },
        });
    }
    async createDepartment(name, description) {
        return database_1.default.department.create({ data: { department_name: name, description } });
    }
    async updateDepartment(id, name, description) {
        return database_1.default.department.update({
            where: { id },
            data: { department_name: name, description },
        });
    }
    async deleteDepartment(id) {
        const hasEmployees = await database_1.default.employee.count({ where: { department_id: id } });
        if (hasEmployees)
            throw new errorHandler_1.AppError('Cannot delete department with active employees', 400);
        return database_1.default.department.delete({ where: { id } });
    }
    async getAllRoles() {
        return database_1.default.role.findMany({ orderBy: { role_name: 'asc' } });
    }
    async getOrgAnalytics() {
        const [totalEmployees, byDepartment, byRole, attendanceToday, pendingLeaves] = await Promise.all([
            database_1.default.employee.count({ where: { employment_status: 'ACTIVE' } }),
            database_1.default.employee.groupBy({
                by: ['department_id'],
                where: { employment_status: 'ACTIVE' },
                _count: { id: true },
            }),
            database_1.default.user.groupBy({ by: ['role_id'], _count: { id: true } }),
            database_1.default.attendance.count({
                where: {
                    attendance_date: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(),
                    status: { in: ['PRESENT', 'LATE'] },
                },
            }),
            database_1.default.leaveRequest.count({ where: { status: 'PENDING' } }),
        ]);
        // Get department names
        const departments = await database_1.default.department.findMany({ select: { id: true, department_name: true } });
        const departmentMap = Object.fromEntries(departments.map((d) => [d.id, d.department_name]));
        const roles = await database_1.default.role.findMany({ select: { id: true, role_name: true } });
        const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.role_name]));
        return {
            totalEmployees,
            attendanceToday,
            pendingLeaves,
            byDepartment: byDepartment.map((d) => ({
                department: d.department_id ? departmentMap[d.department_id] : 'Unassigned',
                count: d._count.id,
            })),
            byRole: byRole.map((r) => ({
                role: r.role_id ? roleMap[r.role_id] : 'No Role',
                count: r._count.id,
            })),
        };
    }
    async updateUserRole(userId, roleId) {
        const role = await database_1.default.role.findUnique({ where: { id: roleId } });
        if (!role)
            throw new errorHandler_1.AppError('Role not found', 404);
        return database_1.default.user.update({ where: { id: userId }, data: { role_id: roleId } });
    }
    async toggleUserStatus(userId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        return database_1.default.user.update({ where: { id: userId }, data: { is_active: !user.is_active } });
    }
    async getAuditLogs(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            database_1.default.auditLog.findMany({
                skip,
                take: limit,
                include: { user: { select: { email: true } } },
                orderBy: { created_at: 'desc' },
            }),
            database_1.default.auditLog.count(),
        ]);
        return { logs, total, page, limit };
    }
}
exports.HRService = HRService;
exports.default = new HRService();
//# sourceMappingURL=hr.service.js.map