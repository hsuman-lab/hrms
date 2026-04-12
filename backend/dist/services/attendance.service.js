"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
const LATE_THRESHOLD_HOUR = 9;
const LATE_THRESHOLD_MINUTE = 15;
class AttendanceService {
    async clockIn(employeeId) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const existing = await database_1.default.attendance.findUnique({
            where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
        });
        if (existing?.clock_in) {
            throw new errorHandler_1.AppError('Already clocked in today', 400);
        }
        const isLate = now.getHours() > LATE_THRESHOLD_HOUR ||
            (now.getHours() === LATE_THRESHOLD_HOUR && now.getMinutes() > LATE_THRESHOLD_MINUTE);
        if (existing) {
            return database_1.default.attendance.update({
                where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
                data: { clock_in: now, status: isLate ? 'LATE' : 'PRESENT' },
            });
        }
        return database_1.default.attendance.create({
            data: {
                employee_id: employeeId,
                attendance_date: today,
                clock_in: now,
                status: isLate ? 'LATE' : 'PRESENT',
            },
        });
    }
    async clockOut(employeeId) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const record = await database_1.default.attendance.findUnique({
            where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
        });
        if (!record?.clock_in)
            throw new errorHandler_1.AppError('Must clock in before clocking out', 400);
        if (record.clock_out)
            throw new errorHandler_1.AppError('Already clocked out today', 400);
        const clockInTime = record.clock_in;
        const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        const status = hoursWorked < 4 ? 'HALF_DAY' : record.status || 'PRESENT';
        return database_1.default.attendance.update({
            where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
            data: { clock_out: now, status },
        });
    }
    async getAttendanceHistory(employeeId, startDate, endDate, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const where = { employee_id: employeeId };
        if (startDate || endDate) {
            where.attendance_date = {};
            if (startDate)
                where.attendance_date.gte = new Date(startDate);
            if (endDate)
                where.attendance_date.lte = new Date(endDate);
        }
        const [records, total] = await Promise.all([
            database_1.default.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { attendance_date: 'desc' },
            }),
            database_1.default.attendance.count({ where }),
        ]);
        return { records, total, page, limit };
    }
    async getTodayStatus(employeeId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return database_1.default.attendance.findUnique({
            where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
        });
    }
    async getTeamAttendance(managerId, date) {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const teamMembers = await database_1.default.employee.findMany({
            where: { manager_id: managerId },
            select: { id: true, first_name: true, last_name: true, employee_code: true },
        });
        const attendance = await database_1.default.attendance.findMany({
            where: {
                employee_id: { in: teamMembers.map((m) => m.id) },
                attendance_date: targetDate,
            },
        });
        return teamMembers.map((member) => ({
            ...member,
            attendance: attendance.find((a) => a.employee_id === member.id) || null,
        }));
    }
    async getMonthlyReport(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        return database_1.default.attendance.findMany({
            where: {
                attendance_date: { gte: startDate, lte: endDate },
            },
            include: {
                employee: {
                    select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
                },
            },
            orderBy: [{ employee_id: 'asc' }, { attendance_date: 'asc' }],
        });
    }
}
exports.AttendanceService = AttendanceService;
exports.default = new AttendanceService();
//# sourceMappingURL=attendance.service.js.map