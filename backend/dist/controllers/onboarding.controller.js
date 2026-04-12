"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const onboarding_service_1 = __importDefault(require("../services/onboarding.service"));
const database_1 = __importDefault(require("../config/database"));
class OnboardingController {
    constructor() {
        this.getMasterTasks = async (req, res, next) => {
            try {
                res.json({ success: true, data: await onboarding_service_1.default.getMasterTasks() });
            }
            catch (e) {
                next(e);
            }
        };
        this.createMasterTask = async (req, res, next) => {
            try {
                res.status(201).json({ success: true, data: await onboarding_service_1.default.createMasterTask(req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getMyChecklist = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await onboarding_service_1.default.getMyChecklist(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.bootstrapChecklist = async (req, res, next) => {
            try {
                const { employeeId } = req.params;
                res.json({ success: true, data: await onboarding_service_1.default.bootstrapChecklist(employeeId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateChecklistItem = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await onboarding_service_1.default.updateChecklistItem(req.params.id, empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getPolicies = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await onboarding_service_1.default.getPolicies(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.acknowledgePolicy = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                const ipAddress = req.ip || req.headers['x-forwarded-for'];
                res.json({ success: true, data: await onboarding_service_1.default.acknowledgePolicy(empId, { ...req.body, ipAddress }) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getExperience = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await onboarding_service_1.default.getExperience(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.submitExperience = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await onboarding_service_1.default.submitExperience(empId, req.body) });
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
exports.default = new OnboardingController();
//# sourceMappingURL=onboarding.controller.js.map