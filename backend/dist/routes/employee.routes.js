"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = __importDefault(require("../controllers/employee.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/me', (req, res, next) => employee_controller_1.default.getMyProfile(req, res, next));
router.get('/dashboard', (req, res, next) => employee_controller_1.default.getDashboard(req, res, next));
router.get('/is-manager', (req, res, next) => employee_controller_1.default.hasSubordinates(req, res, next));
router.get('/team', (0, rbac_1.authorize)('EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'), (req, res, next) => employee_controller_1.default.getTeam(req, res, next));
router.get('/', (0, rbac_1.authorize)('HR', 'HR_MANAGER', 'FINANCE'), (req, res, next) => employee_controller_1.default.getAll(req, res, next));
router.get('/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER', 'EMPLOYEE_MANAGER'), (req, res, next) => employee_controller_1.default.getById(req, res, next));
router.post('/', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => employee_controller_1.default.create(req, res, next));
router.put('/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => employee_controller_1.default.update(req, res, next));
router.put('/:id/salary-structure', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => employee_controller_1.default.updateSalaryStructure(req, res, next));
exports.default = router;
//# sourceMappingURL=employee.routes.js.map