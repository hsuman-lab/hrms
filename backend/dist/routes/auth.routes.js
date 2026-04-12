"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_1 = require("../middlewares/auth");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/login', rateLimiter_1.authLimiter, (req, res, next) => auth_controller_1.default.login(req, res, next));
router.get('/me', auth_1.authenticate, (req, res, next) => auth_controller_1.default.me(req, res, next));
router.put('/change-password', auth_1.authenticate, (req, res, next) => auth_controller_1.default.changePassword(req, res, next));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map