"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pms_controller_1 = __importDefault(require("../controllers/pms.controller"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Goals
router.get('/goals', (req, res, next) => pms_controller_1.default.getMyGoals(req, res, next));
router.post('/goals', (req, res, next) => pms_controller_1.default.createGoal(req, res, next));
router.patch('/goals/:id', (req, res, next) => pms_controller_1.default.updateGoal(req, res, next));
router.get('/team/goals', (req, res, next) => pms_controller_1.default.getTeamGoals(req, res, next));
// Self Assessments
router.get('/assessments', (req, res, next) => pms_controller_1.default.getMySelfAssessments(req, res, next));
router.put('/assessments', (req, res, next) => pms_controller_1.default.upsertSelfAssessment(req, res, next));
// Manager Reviews
router.get('/reviews/pending', (req, res, next) => pms_controller_1.default.getPendingReviews(req, res, next));
router.put('/reviews/:id', (req, res, next) => pms_controller_1.default.submitManagerReview(req, res, next));
// 360 Feedback
router.get('/feedback', (req, res, next) => pms_controller_1.default.getFeedbackReceived(req, res, next));
router.post('/feedback', (req, res, next) => pms_controller_1.default.submitFeedback(req, res, next));
// Skills
router.get('/skills', (req, res, next) => pms_controller_1.default.getSkills(req, res, next));
router.post('/skills', (req, res, next) => pms_controller_1.default.addSkill(req, res, next));
router.delete('/skills/:id', (req, res, next) => pms_controller_1.default.deleteSkill(req, res, next));
// Skill Plans
router.get('/skill-plans', (req, res, next) => pms_controller_1.default.getSkillPlans(req, res, next));
router.post('/skill-plans', (req, res, next) => pms_controller_1.default.createSkillPlan(req, res, next));
router.patch('/skill-plans/:id', (req, res, next) => pms_controller_1.default.updateSkillPlan(req, res, next));
exports.default = router;
//# sourceMappingURL=pms.routes.js.map