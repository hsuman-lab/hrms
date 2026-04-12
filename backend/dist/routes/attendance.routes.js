"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = __importDefault(require("../controllers/attendance.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/clock-in', (req, res, next) => attendance_controller_1.default.clockIn(req, res, next));
router.post('/clock-out', (req, res, next) => attendance_controller_1.default.clockOut(req, res, next));
router.get('/today', (req, res, next) => attendance_controller_1.default.getToday(req, res, next));
router.get('/history', (req, res, next) => attendance_controller_1.default.getHistory(req, res, next));
router.get('/team', (0, rbac_1.authorize)('EMPLOYEE_MANAGER'), (req, res, next) => attendance_controller_1.default.getTeamAttendance(req, res, next));
router.get('/report', (0, rbac_1.authorize)('HR', 'HR_MANAGER', 'FINANCE'), (req, res, next) => attendance_controller_1.default.getMonthlyReport(req, res, next));
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map