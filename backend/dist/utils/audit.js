"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const logAudit = async (userId, action, entityType, entityId, metadata) => {
    try {
        await database_1.default.auditLog.create({
            data: {
                user_id: userId,
                action,
                entity_type: entityType,
                entity_id: entityId,
                metadata: metadata ?? client_1.Prisma.JsonNull,
            },
        });
    }
    catch (err) {
        console.error('Audit log failed:', err);
    }
};
exports.logAudit = logAudit;
//# sourceMappingURL=audit.js.map