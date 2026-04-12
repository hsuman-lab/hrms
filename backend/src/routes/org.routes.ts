import { Router } from 'express';
import orgController from '../controllers/org.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/rbac';

const router = Router();
router.use(authenticate);

// Org Chart & Directory (all authenticated employees)
router.get('/chart',                         (req, res, next) => orgController.getOrgChart(req, res, next));
router.get('/directory',                     (req, res, next) => orgController.getTeamDirectory(req, res, next));

// Job Postings
router.get('/jobs',                          (req, res, next) => orgController.getJobPostings(req, res, next));
router.get('/jobs/:id',                      (req, res, next) => orgController.getJobPostingById(req, res, next));
router.post('/jobs', authorize('HR', 'HR_MANAGER'), (req, res, next) => orgController.createJobPosting(req, res, next));
router.patch('/jobs/:id', authorize('HR', 'HR_MANAGER'), (req, res, next) => orgController.updateJobPosting(req, res, next));

// Applications
router.post('/jobs/:id/apply',               (req, res, next) => orgController.applyToJob(req, res, next));
router.get('/my-applications',               (req, res, next) => orgController.getMyApplications(req, res, next));
router.get('/jobs/:id/applications', authorize('HR', 'HR_MANAGER', 'EMPLOYEE_MANAGER'), (req, res, next) => orgController.getApplicationsForPosting(req, res, next));
router.patch('/applications/:id', authorize('HR', 'HR_MANAGER'), (req, res, next) => orgController.updateApplicationStatus(req, res, next));

export default router;
