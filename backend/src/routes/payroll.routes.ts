import { Router } from 'express';
import payrollController from '../controllers/payroll.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/my', (req, res, next) => payrollController.getMyPayroll(req, res, next));
router.get('/monthly', authorize('FINANCE', 'HR_MANAGER'), (req, res, next) => payrollController.getMonthly(req, res, next));
router.get('/summary', authorize('FINANCE', 'HR_MANAGER'), (req, res, next) => payrollController.getSummary(req, res, next));
router.get('/export', authorize('FINANCE', 'HR_MANAGER'), (req, res, next) => payrollController.exportCSV(req, res, next));
router.post('/generate', authorize('FINANCE', 'HR_MANAGER'), (req, res, next) => payrollController.generate(req, res, next));

export default router;
