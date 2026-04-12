"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_controller_1 = __importDefault(require("../controllers/leave.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Leave types (HR manages)
router.get('/types', (req, res, next) => leave_controller_1.default.getLeaveTypes(req, res, next));
router.post('/types', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => leave_controller_1.default.createLeaveType(req, res, next));
router.put('/types/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => leave_controller_1.default.updateLeaveType(req, res, next));
// Employee leave
router.post('/apply', (req, res, next) => leave_controller_1.default.apply(req, res, next));
router.get('/my', (req, res, next) => leave_controller_1.default.getMyLeaves(req, res, next));
router.get('/balance', (req, res, next) => leave_controller_1.default.getBalance(req, res, next));
// Manager approval
router.get('/pending', (0, rbac_1.authorize)('EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'), (req, res, next) => leave_controller_1.default.getPendingApprovals(req, res, next));
router.post('/:id/approve', (0, rbac_1.authorize)('EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'), (req, res, next) => leave_controller_1.default.approve(req, res, next));
// HR view all
router.get('/all', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => leave_controller_1.default.getAllLeavesHR(req, res, next));
exports.default = router;
//# sourceMappingURL=leave.routes.js.map