import { Router } from 'express';
import reimbursementController from '../controllers/reimbursement.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();
router.use(authenticate);

// Employee: submit + view own
router.post('/',     (req, res, next) => reimbursementController.apply(req, res, next));
router.get('/my',    (req, res, next) => reimbursementController.getMine(req, res, next));

// Manager: view pending team reimbursements + approve/reject
router.get('/pending-team',  (req, res, next) => reimbursementController.getPendingForManager(req, res, next));
router.patch('/:id/action',  (req, res, next) => reimbursementController.action(req, res, next));

// HR: view all
router.get('/', authorize('HR', 'HR_MANAGER'), (req, res, next) => reimbursementController.getAllHR(req, res, next));

export default router;
