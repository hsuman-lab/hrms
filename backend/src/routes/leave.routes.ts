import { Router } from 'express';
import leaveController from '../controllers/leave.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);

// Leave types (HR manages)
router.get('/types', (req, res, next) => leaveController.getLeaveTypes(req, res, next));
router.post('/types', authorize('HR', 'HR_MANAGER'), (req, res, next) => leaveController.createLeaveType(req, res, next));
router.put('/types/:id', authorize('HR', 'HR_MANAGER'), (req, res, next) => leaveController.updateLeaveType(req, res, next));

// Employee leave
router.post('/apply', (req, res, next) => leaveController.apply(req, res, next));
router.get('/my', (req, res, next) => leaveController.getMyLeaves(req, res, next));
router.get('/balance', (req, res, next) => leaveController.getBalance(req, res, next));

// Manager approval
router.get('/pending', authorize('EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'), (req, res, next) => leaveController.getPendingApprovals(req, res, next));
router.post('/:id/approve', authorize('EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'), (req, res, next) => leaveController.approve(req, res, next));

// HR view all
router.get('/all', authorize('HR', 'HR_MANAGER'), (req, res, next) => leaveController.getAllLeavesHR(req, res, next));

export default router;
