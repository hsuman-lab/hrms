"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payroll_controller_1 = __importDefault(require("../controllers/payroll.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/my', (req, res, next) => payroll_controller_1.default.getMyPayroll(req, res, next));
router.get('/monthly', (0, rbac_1.authorize)('FINANCE', 'HR_MANAGER'), (req, res, next) => payroll_controller_1.default.getMonthly(req, res, next));
router.get('/summary', (0, rbac_1.authorize)('FINANCE', 'HR_MANAGER'), (req, res, next) => payroll_controller_1.default.getSummary(req, res, next));
router.get('/export', (0, rbac_1.authorize)('FINANCE', 'HR_MANAGER'), (req, res, next) => payroll_controller_1.default.exportCSV(req, res, next));
router.post('/generate', (0, rbac_1.authorize)('FINANCE', 'HR_MANAGER'), (req, res, next) => payroll_controller_1.default.generate(req, res, next));
exports.default = router;
//# sourceMappingURL=payroll.routes.js.map