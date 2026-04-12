"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ess_service_1 = __importDefault(require("../services/ess.service"));
const database_1 = __importDefault(require("../config/database"));
class EssController {
    constructor() {
        // Addresses
        this.getAddresses = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.getAddresses(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.upsertAddress = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.upsertAddress(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // Bank
        this.getBankDetail = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.getBankDetail(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.upsertBankDetail = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.upsertBankDetail(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        // Emergency Contacts
        this.getEmergencyContacts = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.getEmergencyContacts(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.addEmergencyContact = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await ess_service_1.default.addEmergencyContact(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.updateEmergencyContact = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.updateEmergencyContact(req.params.id, empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.deleteEmergencyContact = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json(await ess_service_1.default.deleteEmergencyContact(req.params.id, empId));
            }
            catch (e) {
                next(e);
            }
        };
        // Documents
        this.getDocuments = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json({ success: true, data: await ess_service_1.default.getDocuments(empId) });
            }
            catch (e) {
                next(e);
            }
        };
        this.addDocument = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.status(201).json({ success: true, data: await ess_service_1.default.addDocument(empId, req.body) });
            }
            catch (e) {
                next(e);
            }
        };
        this.deleteDocument = async (req, res, next) => {
            try {
                const empId = await this.getEmployeeId(req);
                res.json(await ess_service_1.default.deleteDocument(req.params.id, empId));
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
exports.default = new EssController();
//# sourceMappingURL=ess.controller.js.map