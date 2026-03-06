import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.post('/clock-in', (req, res, next) => attendanceController.clockIn(req, res, next));
router.post('/clock-out', (req, res, next) => attendanceController.clockOut(req, res, next));
router.get('/today', (req, res, next) => attendanceController.getToday(req, res, next));
router.get('/history', (req, res, next) => attendanceController.getHistory(req, res, next));
router.get('/team', authorize('EMPLOYEE_MANAGER'), (req, res, next) => attendanceController.getTeamAttendance(req, res, next));
router.get('/report', authorize('HR', 'HR_MANAGER', 'FINANCE'), (req, res, next) => attendanceController.getMonthlyReport(req, res, next));

export default router;
