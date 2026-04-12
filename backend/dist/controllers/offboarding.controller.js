"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const offboarding_service_1 = __importDefault(require("../services/offboarding.service"));
const database_1 = __importDefault(require("../config/database"));
class OffboardingController {
    constructor() {
        this.getMyResignation = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.getMyResignation(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.submitResignation = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await offboarding_service_1.default.submitResignation(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.withdrawResignation = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.withdrawResignation(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getPendingResignations = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.getPendingResignations(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.actionResignation = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                const { status, remarks } = req.body;
                res.json({ success: true, data: await offboarding_service_1.default.actionResignation(req.params.id, empId, status, remarks) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getExitInterview = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.getExitInterview(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.submitExitInterview = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.submitExitInterview(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getFnFSettlement = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.getFnFSettlement(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.upsertFnFSettlement = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.upsertFnFSettlement(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.getMyOffboardingChecklist = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.getMyOffboardingChecklist(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.bootstrapOffboardingChecklist = async (req, res, next) => {
            try {
                const { employeeId } = req.params;
                res.json({ success: true, data: await offboarding_service_1.default.bootstrapOffboardingChecklist(employeeId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateOffboardingItem = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await offboarding_service_1.default.updateOffboardingItem(req.params.id, empId, req.body) });
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
exports.default = new OffboardingController();
//# sourceMappingURL=offboarding.controller.js.map