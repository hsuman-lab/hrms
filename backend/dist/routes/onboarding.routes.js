"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const onboarding_controller_1 = __importDefault(require("../controllers/onboarding.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Master tasks (HR manages)
router.get('/tasks', (req, res, next) => onboarding_controller_1.default.getMasterTasks(req, res, next));
router.post('/tasks', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => onboarding_controller_1.default.createMasterTask(req, res, next));
// Employee checklist
router.get('/checklist', (req, res, next) => onboarding_controller_1.default.getMyChecklist(req, res, next));
router.patch('/checklist/:id', (req, res, next) => onboarding_controller_1.default.updateChecklistItem(req, res, next));
router.post('/bootstrap/:employeeId', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => onboarding_controller_1.default.bootstrapChecklist(req, res, next));
// Policy acknowledgements
router.get('/policies', (req, res, next) => onboarding_controller_1.default.getPolicies(req, res, next));
router.post('/policies/acknowledge', (req, res, next) => onboarding_controller_1.default.acknowledgePolicy(req, res, next));
// Onboarding experience / rating
router.get('/experience', (req, res, next) => onboarding_controller_1.default.getExperience(req, res, next));
router.put('/experience', (req, res, next) => onboarding_controller_1.default.submitExperience(req, res, next));
exports.default = router;
//# sourceMappingURL=onboarding.routes.js.map