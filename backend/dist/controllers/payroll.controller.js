"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const payroll_service_1 = __importDefault(require("../services/payroll.service"));
const audit_1 = require("../utils/audit");
class PayrollController {
    async generate(req, res, next) {
        try {
            const month = parseInt(req.body.month);
            const year = parseInt(req.body.year);
            if (!month || !year || month < 1 || month > 12) {
                res.status(400).json({ success: false, error: 'Invalid month or year' });
                return;
            }
            const result = await payroll_service_1.default.generatePayroll(month, year, req.user.userId);
            await (0, audit_1.logAudit)(req.user?.userId, 'GENERATE_PAYROLL', 'PayrollRecord', undefined, { month, year });
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getMonthly(req, res, next) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const records = await payroll_service_1.default.getMonthlyPayroll(month, year);
            res.json({ success: true, data: records });
        }
        catch (err) {
            next(err);
        }
    }
    async getMyPayroll(req, res, next) {
        try {
            const records = await payroll_service_1.default.getEmployeePayroll(req.user.employeeId);
            res.json({ success: true, data: records });
        }
        catch (err) {
            next(err);
        }
    }
    async exportCSV(req, res, next) {
        try {
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const csv = await payroll_service_1.default.exportPayrollCSV(month, year);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=payroll-${year}-${month}.csv`);
            res.send(csv);
        }
        catch (err) {
            next(err);
        }
    }
    async getSummary(req, res, next) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const summary = await payroll_service_1.default.getPayrollSummary(year);
            res.json({ success: true, data: summary });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PayrollController = PayrollController;
exports.default = new PayrollController();
//# sourceMappingURL=payroll.controller.js.map