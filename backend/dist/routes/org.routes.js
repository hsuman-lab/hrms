"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const org_controller_1 = __importDefault(require("../controllers/org.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Org Chart & Directory (all authenticated employees)
router.get('/chart', (req, res, next) => org_controller_1.default.getOrgChart(req, res, next));
router.get('/directory', (req, res, next) => org_controller_1.default.getTeamDirectory(req, res, next));
// Job Postings
router.get('/jobs', (req, res, next) => org_controller_1.default.getJobPostings(req, res, next));
router.get('/jobs/:id', (req, res, next) => org_controller_1.default.getJobPostingById(req, res, next));
router.post('/jobs', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => org_controller_1.default.createJobPosting(req, res, next));
router.patch('/jobs/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => org_controller_1.default.updateJobPosting(req, res, next));
// Applications
router.post('/jobs/:id/apply', (req, res, next) => org_controller_1.default.applyToJob(req, res, next));
router.get('/my-applications', (req, res, next) => org_controller_1.default.getMyApplications(req, res, next));
router.get('/jobs/:id/applications', (0, rbac_1.authorize)('HR', 'HR_MANAGER', 'EMPLOYEE_MANAGER'), (req, res, next) => org_controller_1.default.getApplicationsForPosting(req, res, next));
router.patch('/applications/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => org_controller_1.default.updateApplicationStatus(req, res, next));
exports.default = router;
//# sourceMappingURL=org.routes.js.map