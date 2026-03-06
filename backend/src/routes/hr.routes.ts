import { Router } from 'express';
import hrController from '../controllers/hr.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);
router.use(authorize('HR', 'HR_MANAGER'));

router.get('/departments', (req, res, next) => hrController.getDepartments(req, res, next));
router.post('/departments', (req, res, next) => hrController.createDepartment(req, res, next));
router.put('/departments/:id', (req, res, next) => hrController.updateDepartment(req, res, next));
router.delete('/departments/:id', (req, res, next) => hrController.deleteDepartment(req, res, next));

router.get('/roles', (req, res, next) => hrController.getRoles(req, res, next));
router.get('/analytics', (req, res, next) => hrController.getAnalytics(req, res, next));
router.get('/audit-logs', (req, res, next) => hrController.getAuditLogs(req, res, next));

router.put('/users/:userId/role', (req, res, next) => hrController.updateUserRole(req, res, next));
router.put('/users/:userId/toggle-status', (req, res, next) => hrController.toggleUserStatus(req, res, next));

export default router;
