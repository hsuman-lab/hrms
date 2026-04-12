"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const audit_1 = require("../utils/audit");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(8),
});
class AuthController {
    async login(req, res, next) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            const result = await auth_service_1.default.login(email, password);
            await (0, audit_1.logAudit)(result.user.id, 'LOGIN', 'User', result.user.id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async me(req, res, next) {
        try {
            res.json({ success: true, data: req.user });
        }
        catch (err) {
            next(err);
        }
    }
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
            await auth_service_1.default.changePassword(req.user.userId, currentPassword, newPassword);
            res.json({ success: true, message: 'Password changed successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map