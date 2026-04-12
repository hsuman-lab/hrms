import { Router } from 'express';
import onboardingController from '../controllers/onboarding.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();
router.use(authenticate);

// Master tasks (HR manages)
router.get('/tasks',                              (req, res, next) => onboardingController.getMasterTasks(req, res, next));
router.post('/tasks', authorize('HR', 'HR_MANAGER'), (req, res, next) => onboardingController.createMasterTask(req, res, next));

// Employee checklist
router.get('/checklist',                          (req, res, next) => onboardingController.getMyChecklist(req, res, next));
router.patch('/checklist/:id',                    (req, res, next) => onboardingController.updateChecklistItem(req, res, next));
router.post('/bootstrap/:employeeId', authorize('HR', 'HR_MANAGER'), (req, res, next) => onboardingController.bootstrapChecklist(req, res, next));

// Policy acknowledgements
router.get('/policies',                           (req, res, next) => onboardingController.getPolicies(req, res, next));
router.post('/policies/acknowledge',              (req, res, next) => onboardingController.acknowledgePolicy(req, res, next));

// Onboarding experience / rating
router.get('/experience',                         (req, res, next) => onboardingController.getExperience(req, res, next));
router.put('/experience',                         (req, res, next) => onboardingController.submitExperience(req, res, next));

export default router;
