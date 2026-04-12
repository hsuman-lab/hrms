import { Router } from 'express';
import learningController from '../controllers/learning.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();
router.use(authenticate);

// Employee routes — any authenticated user
router.get('/my',                     (req, res, next) => learningController.getMyEnrollments(req, res, next));
router.patch('/my/:courseId/progress',(req, res, next) => learningController.updateProgress(req, res, next));

// Public course list (all authenticated) — employees need to see course catalogue
router.get('/courses',                (req, res, next) => learningController.getCourses(req, res, next));

// HR-only routes
router.post('/courses',               authorize('HR', 'HR_MANAGER'), (req, res, next) => learningController.createCourse(req, res, next));
router.put('/courses/:id',            authorize('HR', 'HR_MANAGER'), (req, res, next) => learningController.updateCourse(req, res, next));
router.delete('/courses/:id',         authorize('HR', 'HR_MANAGER'), (req, res, next) => learningController.deleteCourse(req, res, next));
router.post('/courses/:id/enroll',    authorize('HR', 'HR_MANAGER'), (req, res, next) => learningController.enrollToCourse(req, res, next));
router.get('/courses/:id/enrollments',authorize('HR', 'HR_MANAGER'), (req, res, next) => learningController.getCourseEnrollments(req, res, next));
router.get('/stats',                  authorize('HR', 'HR_MANAGER'), (req, res, next) => learningController.getLearningStats(req, res, next));

// Certificates
router.get('/certificates',           (req, res, next) => learningController.getMyCertificates(req, res, next));
router.post('/certificates',          (req, res, next) => learningController.addCertificate(req, res, next));
router.patch('/certificates/:id',     (req, res, next) => learningController.updateCertificate(req, res, next));
router.delete('/certificates/:id',    (req, res, next) => learningController.deleteCertificate(req, res, next));

export default router;
