import { Router } from 'express';
import pmsController from '../controllers/pms.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Goals
router.get('/goals',              (req, res, next) => pmsController.getMyGoals(req, res, next));
router.post('/goals',             (req, res, next) => pmsController.createGoal(req, res, next));
router.patch('/goals/:id',        (req, res, next) => pmsController.updateGoal(req, res, next));
router.get('/team/goals',         (req, res, next) => pmsController.getTeamGoals(req, res, next));

// Self Assessments
router.get('/assessments',        (req, res, next) => pmsController.getMySelfAssessments(req, res, next));
router.put('/assessments',        (req, res, next) => pmsController.upsertSelfAssessment(req, res, next));

// Manager Reviews
router.get('/reviews/pending',    (req, res, next) => pmsController.getPendingReviews(req, res, next));
router.put('/reviews/:id',        (req, res, next) => pmsController.submitManagerReview(req, res, next));

// 360 Feedback
router.get('/feedback',           (req, res, next) => pmsController.getFeedbackReceived(req, res, next));
router.post('/feedback',          (req, res, next) => pmsController.submitFeedback(req, res, next));

// Skills
router.get('/skills',             (req, res, next) => pmsController.getSkills(req, res, next));
router.post('/skills',            (req, res, next) => pmsController.addSkill(req, res, next));
router.delete('/skills/:id',      (req, res, next) => pmsController.deleteSkill(req, res, next));

// Skill Plans
router.get('/skill-plans',        (req, res, next) => pmsController.getSkillPlans(req, res, next));
router.post('/skill-plans',       (req, res, next) => pmsController.createSkillPlan(req, res, next));
router.patch('/skill-plans/:id',  (req, res, next) => pmsController.updateSkillPlan(req, res, next));

export default router;
