"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hr_controller_1 = __importDefault(require("../controllers/hr.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, rbac_1.authorize)('HR', 'HR_MANAGER'));
router.get('/departments', (req, res, next) => hr_controller_1.default.getDepartments(req, res, next));
router.post('/departments', (req, res, next) => hr_controller_1.default.createDepartment(req, res, next));
router.put('/departments/:id', (req, res, next) => hr_controller_1.default.updateDepartment(req, res, next));
router.delete('/departments/:id', (req, res, next) => hr_controller_1.default.deleteDepartment(req, res, next));
router.get('/roles', (req, res, next) => hr_controller_1.default.getRoles(req, res, next));
router.get('/analytics', (req, res, next) => hr_controller_1.default.getAnalytics(req, res, next));
router.get('/audit-logs', (req, res, next) => hr_controller_1.default.getAuditLogs(req, res, next));
router.put('/users/:userId/role', (req, res, next) => hr_controller_1.default.updateUserRole(req, res, next));
router.put('/users/:userId/toggle-status', (req, res, next) => hr_controller_1.default.toggleUserStatus(req, res, next));
exports.default = router;
//# sourceMappingURL=hr.routes.js.map