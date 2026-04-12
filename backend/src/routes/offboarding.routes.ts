import { Router } from 'express';
import offboardingController from '../controllers/offboarding.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();
router.use(authenticate);

// Resignation
router.get('/resignation',                   (req, res, next) => offboardingController.getMyResignation(req, res, next));
router.post('/resignation',                  (req, res, next) => offboardingController.submitResignation(req, res, next));
router.patch('/resignation/withdraw',        (req, res, next) => offboardingController.withdrawResignation(req, res, next));

// Manager: approve / reject resignation
router.get('/resignation/pending',           (req, res, next) => offboardingController.getPendingResignations(req, res, next));
router.patch('/resignation/approvals/:id',   (req, res, next) => offboardingController.actionResignation(req, res, next));

// Exit Interview
router.get('/exit-interview',                (req, res, next) => offboardingController.getExitInterview(req, res, next));
router.put('/exit-interview',                (req, res, next) => offboardingController.submitExitInterview(req, res, next));

// F&F Settlement
router.get('/fnf',                           (req, res, next) => offboardingController.getFnFSettlement(req, res, next));
router.put('/fnf', authorize('HR', 'HR_MANAGER', 'FINANCE'), (req, res, next) => offboardingController.upsertFnFSettlement(req, res, next));

// Offboarding checklist
router.get('/checklist',                     (req, res, next) => offboardingController.getMyOffboardingChecklist(req, res, next));
router.patch('/checklist/:id',               (req, res, next) => offboardingController.updateOffboardingItem(req, res, next));
router.post('/bootstrap/:employeeId', authorize('HR', 'HR_MANAGER'), (req, res, next) => offboardingController.bootstrapOffboardingChecklist(req, res, next));

export default router;
