"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }
    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        res.status(409).json({ success: false, error: 'Record already exists' });
        return;
    }
    // Prisma record not found
    if (err.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Record not found' });
        return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map