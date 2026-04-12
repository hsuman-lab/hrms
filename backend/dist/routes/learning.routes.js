"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const learning_controller_1 = __importDefault(require("../controllers/learning.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Employee routes — any authenticated user
router.get('/my', (req, res, next) => learning_controller_1.default.getMyEnrollments(req, res, next));
router.patch('/my/:courseId/progress', (req, res, next) => learning_controller_1.default.updateProgress(req, res, next));
// Public course list (all authenticated) — employees need to see course catalogue
router.get('/courses', (req, res, next) => learning_controller_1.default.getCourses(req, res, next));
// HR-only routes
router.post('/courses', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => learning_controller_1.default.createCourse(req, res, next));
router.put('/courses/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => learning_controller_1.default.updateCourse(req, res, next));
router.delete('/courses/:id', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => learning_controller_1.default.deleteCourse(req, res, next));
router.post('/courses/:id/enroll', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => learning_controller_1.default.enrollToCourse(req, res, next));
router.get('/courses/:id/enrollments', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => learning_controller_1.default.getCourseEnrollments(req, res, next));
router.get('/stats', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => learning_controller_1.default.getLearningStats(req, res, next));
// Certificates
router.get('/certificates', (req, res, next) => learning_controller_1.default.getMyCertificates(req, res, next));
router.post('/certificates', (req, res, next) => learning_controller_1.default.addCertificate(req, res, next));
router.patch('/certificates/:id', (req, res, next) => learning_controller_1.default.updateCertificate(req, res, next));
router.delete('/certificates/:id', (req, res, next) => learning_controller_1.default.deleteCertificate(req, res, next));
exports.default = router;
//# sourceMappingURL=learning.routes.js.map