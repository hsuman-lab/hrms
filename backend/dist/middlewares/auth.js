"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const database_1 = __importDefault(require("../config/database"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.secret);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true, employee: true },
        });
        if (!user || !user.is_active) {
            res.status(401).json({ success: false, error: 'User not found or inactive' });
            return;
        }
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role?.role_name || '',
            employeeId: user.employee?.id,
        };
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map