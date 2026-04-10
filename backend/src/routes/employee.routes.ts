import { Router } from 'express';
import employeeController from '../controllers/employee.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res, next) => employeeController.getMyProfile(req, res, next));
router.get('/dashboard', (req, res, next) => employeeController.getDashboard(req, res, next));
router.get('/is-manager', (req, res, next) => employeeController.hasSubordinates(req, res, next));
router.get('/team', authorize('EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'), (req, res, next) => employeeController.getTeam(req, res, next));
router.get('/', authorize('HR', 'HR_MANAGER', 'FINANCE'), (req, res, next) => employeeController.getAll(req, res, next));
router.get('/:id', authorize('HR', 'HR_MANAGER', 'EMPLOYEE_MANAGER'), (req, res, next) => employeeController.getById(req, res, next));
router.post('/', authorize('HR', 'HR_MANAGER'), (req, res, next) => employeeController.create(req, res, next));
router.put('/:id', authorize('HR', 'HR_MANAGER'), (req, res, next) => employeeController.update(req, res, next));
router.put('/:id/salary-structure', authorize('HR', 'HR_MANAGER'), (req, res, next) => employeeController.updateSalaryStructure(req, res, next));

export default router;
