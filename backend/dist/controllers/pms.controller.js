"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pms_service_1 = __importDefault(require("../services/pms.service"));
const database_1 = __importDefault(require("../config/database"));
class PmsController {
    constructor() {
        // Goals
        this.getMyGoals = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                const { period } = req.query;
                res.json({ success: true, data: await pms_service_1.default.getMyGoals(empId, period) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getTeamGoals = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                const { period } = req.query;
                res.json({ success: true, data: await pms_service_1.default.getTeamGoals(empId, period) });
            }
            catch (e) {
                next(e);
            }
        };
        this.createGoal = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await pms_service_1.default.createGoal(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateGoal = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.updateGoal(req.params.id, empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // Self Assessments
        this.getMySelfAssessments = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.getMySelfAssessments(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.upsertSelfAssessment = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.upsertSelfAssessment(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // Manager Review
        this.getPendingReviews = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.getPendingReviews(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.submitManagerReview = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.submitManagerReview(empId, req.params.id, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // 360 Feedback
        this.getFeedbackReceived = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.getFeedbackReceived(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.submitFeedback = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await pms_service_1.default.submitFeedback(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // Skills
        this.getSkills = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.getSkills(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.addSkill = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await pms_service_1.default.addSkill(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.deleteSkill = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json(await pms_service_1.default.deleteSkill(req.params.id, empId));
            }
            catch (e) {
                next(e);
            }
        };
        // Skill Plans
        this.getSkillPlans = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.getSkillPlans(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.createSkillPlan = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await pms_service_1.default.createSkillPlan(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateSkillPlan = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await pms_service_1.default.updateSkillPlan(req.params.id, empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
    }
    async getEmployeeId(req) {
        const emp = await database_1.default.employee.findUnique({ where: { user_id: req.user.userId }, select: { id: true } });
        if (!emp)
            throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
        return emp.id;
    }
}
exports.default = new PmsController();
//# sourceMappingURL=pms.controller.js.map