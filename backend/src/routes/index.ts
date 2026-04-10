import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import attendanceRoutes from './attendance.routes';
import leaveRoutes from './leave.routes';
import payrollRoutes from './payroll.routes';
import hrRoutes from './hr.routes';
import learningRoutes from './learning.routes';
import reimbursementRoutes from './reimbursement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/hr', hrRoutes);
router.use('/learning', learningRoutes);
router.use('/reimbursements', reimbursementRoutes);

export default router;
