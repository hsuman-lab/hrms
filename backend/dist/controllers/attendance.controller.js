"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = __importDefault(require("../services/attendance.service"));
const audit_1 = require("../utils/audit");
class AttendanceController {
    async clockIn(req, res, next) {
        try {
            const employeeId = req.user.employeeId;
            const record = await attendance_service_1.default.clockIn(employeeId);
            await (0, audit_1.logAudit)(req.user?.userId, 'CLOCK_IN', 'Attendance', record.id);
            res.json({ success: true, data: record });
        }
        catch (err) {
            next(err);
        }
    }
    async clockOut(req, res, next) {
        try {
            const employeeId = req.user.employeeId;
            const record = await attendance_service_1.default.clockOut(employeeId);
            await (0, audit_1.logAudit)(req.user?.userId, 'CLOCK_OUT', 'Attendance', record.id);
            res.json({ success: true, data: record });
        }
        catch (err) {
            next(err);
        }
    }
    async getHistory(req, res, next) {
        try {
            const employeeId = req.user.employeeId;
            const { startDate, endDate, page, limit } = req.query;
            const result = await attendance_service_1.default.getAttendanceHistory(employeeId, startDate, endDate, parseInt(page) || 1, parseInt(limit) || 30);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getToday(req, res, next) {
        try {
            const record = await attendance_service_1.default.getTodayStatus(req.user.employeeId);
            res.json({ success: true, data: record });
        }
        catch (err) {
            next(err);
        }
    }
    async getTeamAttendance(req, res, next) {
        try {
            const managerId = req.user.employeeId;
            const date = req.query.date;
            const result = await attendance_service_1.default.getTeamAttendance(managerId, date);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getMonthlyReport(req, res, next) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const result = await attendance_service_1.default.getMonthlyReport(year, month);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AttendanceController = AttendanceController;
exports.default = new AttendanceController();
//# sourceMappingURL=attendance.controller.js.map