"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../config/jwt");
const errorHandler_1 = require("../middlewares/errorHandler");
class AuthService {
    async login(email, password) {
        const user = await database_1.default.user.findUnique({
            where: { email },
            include: { role: true, employee: { include: { department: true } } },
        });
        if (!user || !user.is_active) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValid) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role?.role_name || '',
            employeeId: user.employee?.id,
        };
        const token = jsonwebtoken_1.default.sign(payload, jwt_1.jwtConfig.secret, { expiresIn: jwt_1.jwtConfig.expiresIn });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role?.role_name,
                employee: user.employee
                    ? {
                        id: user.employee.id,
                        employee_code: user.employee.employee_code,
                        first_name: user.employee.first_name,
                        last_name: user.employee.last_name,
                        department: user.employee.department?.department_name,
                    }
                    : null,
            },
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isValid)
            throw new errorHandler_1.AppError('Current password is incorrect', 400);
        const hash = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.default.user.update({ where: { id: userId }, data: { password_hash: hash } });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map