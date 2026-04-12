"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const org_service_1 = __importDefault(require("../services/org.service"));
const database_1 = __importDefault(require("../config/database"));
class OrgController {
    constructor() {
        this.getOrgChart = async (req, res, next) => {
            try {
                res.json({ success: true, data: await org_service_1.default.getOrgChart() });
            }
            catch (e) {
                next(e);
            }
        };
        this.getTeamDirectory = async (req, res, next) => {
            try {
                const { page, limit, search, departmentId } = req.query;
                res.json({ success: true, data: await org_service_1.default.getTeamDirectory(+page || 1, +limit || 20, search, departmentId) });
            }
            catch (e) {
                next(e);
            }
        };
        // Job Postings
        this.getJobPostings = async (req, res, next) => {
            try {
                const { status } = req.query;
                res.json({ success: true, data: await org_service_1.default.getJobPostings(true, status || 'OPEN') });
            }
            catch (e) {
                next(e);
            }
        };
        this.getJobPostingById = async (req, res, next) => {
            try {
                res.json({ success: true, data: await org_service_1.default.getJobPostingById(req.params.id) });
            }
            catch (e) {
                next(e);
            }
        };
        this.createJobPosting = async (req, res, next) => {
            try {
                res.status(201).json({ success: true, data: await org_service_1.default.createJobPosting(req.user.userId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateJobPosting = async (req, res, next) => {
            try {
                res.json({ success: true, data: await org_service_1.default.updateJobPosting(req.params.id, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // Applications
        this.applyToJob = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await org_service_1.default.applyToJob(empId, req.params.id, req.body.coverNote) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getMyApplications = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await org_service_1.default.getMyApplications(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getApplicationsForPosting = async (req, res, next) => {
            try {
                res.json({ success: true, data: await org_service_1.default.getApplicationsForPosting(req.params.id) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateApplicationStatus = async (req, res, next) => {
            try {
                res.json({ success: true, data: await org_service_1.default.updateApplicationStatus(req.params.id, req.body.status) });
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
exports.default = new OrgController();
//# sourceMappingURL=org.controller.js.map