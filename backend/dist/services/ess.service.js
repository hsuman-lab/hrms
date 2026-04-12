"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EssService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middlewares/errorHandler");
class EssService {
    // ── Addresses ──────────────────────────────────────────────────────────────
    async getAddresses(employeeId) {
        return database_1.default.employeeAddress.findMany({ where: { employee_id: employeeId } });
    }
    async upsertAddress(employeeId, data) {
        const existing = await database_1.default.employeeAddress.findFirst({
            where: { employee_id: employeeId, address_type: data.addressType },
        });
        if (existing) {
            return database_1.default.employeeAddress.update({
                where: { id: existing.id },
                data: {
                    line1: data.line1,
                    line2: data.line2,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    country: data.country || 'India',
                },
            });
        }
        return database_1.default.employeeAddress.create({
            data: {
                employee_id: employeeId,
                address_type: data.addressType,
                line1: data.line1,
                line2: data.line2,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                country: data.country || 'India',
            },
        });
    }
    // ── Bank Details ────────────────────────────────────────────────────────────
    async getBankDetail(employeeId) {
        return database_1.default.bankDetail.findUnique({ where: { employee_id: employeeId } });
    }
    async upsertBankDetail(employeeId, data) {
        const existing = await database_1.default.bankDetail.findUnique({ where: { employee_id: employeeId } });
        if (existing) {
            return database_1.default.bankDetail.update({
                where: { employee_id: employeeId },
                data: {
                    bank_name: data.bankName,
                    account_number: data.accountNumber,
                    ifsc_code: data.ifscCode,
                    account_type: data.accountType || 'SAVINGS',
                    branch: data.branch,
                    is_verified: false, // reset verification on update
                },
            });
        }
        return database_1.default.bankDetail.create({
            data: {
                employee_id: employeeId,
                bank_name: data.bankName,
                account_number: data.accountNumber,
                ifsc_code: data.ifscCode,
                account_type: data.accountType || 'SAVINGS',
                branch: data.branch,
            },
        });
    }
    // ── Emergency Contacts ─────────────────────────────────────────────────────
    async getEmergencyContacts(employeeId) {
        return database_1.default.emergencyContact.findMany({ where: { employee_id: employeeId } });
    }
    async addEmergencyContact(employeeId, data) {
        if (data.isPrimary) {
            await database_1.default.emergencyContact.updateMany({
                where: { employee_id: employeeId },
                data: { is_primary: false },
            });
        }
        return database_1.default.emergencyContact.create({
            data: {
                employee_id: employeeId,
                name: data.name,
                relationship: data.relationship,
                phone: data.phone,
                email: data.email,
                is_primary: data.isPrimary || false,
            },
        });
    }
    async updateEmergencyContact(id, employeeId, data) {
        const contact = await database_1.default.emergencyContact.findUnique({ where: { id } });
        if (!contact || contact.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Contact not found', 404);
        if (data.isPrimary) {
            await database_1.default.emergencyContact.updateMany({
                where: { employee_id: employeeId },
                data: { is_primary: false },
            });
        }
        return database_1.default.emergencyContact.update({
            where: { id },
            data: {
                name: data.name,
                relationship: data.relationship,
                phone: data.phone,
                email: data.email,
                is_primary: data.isPrimary,
            },
        });
    }
    async deleteEmergencyContact(id, employeeId) {
        const contact = await database_1.default.emergencyContact.findUnique({ where: { id } });
        if (!contact || contact.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Contact not found', 404);
        await database_1.default.emergencyContact.delete({ where: { id } });
        return { success: true };
    }
    // ── Documents ──────────────────────────────────────────────────────────────
    async getDocuments(employeeId) {
        return database_1.default.employeeDocument.findMany({
            where: { employee_id: employeeId },
            orderBy: { uploaded_at: 'desc' },
        });
    }
    async addDocument(employeeId, data) {
        return database_1.default.employeeDocument.create({
            data: {
                employee_id: employeeId,
                doc_type: data.docType,
                doc_name: data.docName,
                file_url: data.fileUrl,
                file_size: data.fileSize,
                expires_at: data.expiresAt ? new Date(data.expiresAt) : undefined,
            },
        });
    }
    async deleteDocument(id, employeeId) {
        const doc = await database_1.default.employeeDocument.findUnique({ where: { id } });
        if (!doc || doc.employee_id !== employeeId)
            throw new errorHandler_1.AppError('Document not found', 404);
        await database_1.default.employeeDocument.delete({ where: { id } });
        return { success: true };
    }
}
exports.EssService = EssService;
exports.default = new EssService();
//# sourceMappingURL=ess.service.js.map