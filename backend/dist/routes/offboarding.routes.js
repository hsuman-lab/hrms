"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const offboarding_controller_1 = __importDefault(require("../controllers/offboarding.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Resignation
router.get('/resignation', (req, res, next) => offboarding_controller_1.default.getMyResignation(req, res, next));
router.post('/resignation', (req, res, next) => offboarding_controller_1.default.submitResignation(req, res, next));
router.patch('/resignation/withdraw', (req, res, next) => offboarding_controller_1.default.withdrawResignation(req, res, next));
// Manager: approve / reject resignation
router.get('/resignation/pending', (req, res, next) => offboarding_controller_1.default.getPendingResignations(req, res, next));
router.patch('/resignation/approvals/:id', (req, res, next) => offboarding_controller_1.default.actionResignation(req, res, next));
// Exit Interview
router.get('/exit-interview', (req, res, next) => offboarding_controller_1.default.getExitInterview(req, res, next));
router.put('/exit-interview', (req, res, next) => offboarding_controller_1.default.submitExitInterview(req, res, next));
// F&F Settlement
router.get('/fnf', (req, res, next) => offboarding_controller_1.default.getFnFSettlement(req, res, next));
router.put('/fnf', (0, rbac_1.authorize)('HR', 'HR_MANAGER', 'FINANCE'), (req, res, next) => offboarding_controller_1.default.upsertFnFSettlement(req, res, next));
// Offboarding checklist
router.get('/checklist', (req, res, next) => offboarding_controller_1.default.getMyOffboardingChecklist(req, res, next));
router.patch('/checklist/:id', (req, res, next) => offboarding_controller_1.default.updateOffboardingItem(req, res, next));
router.post('/bootstrap/:employeeId', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => offboarding_controller_1.default.bootstrapOffboardingChecklist(req, res, next));
exports.default = router;
//# sourceMappingURL=offboarding.routes.js.map