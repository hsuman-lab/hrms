"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reimbursement_controller_1 = __importDefault(require("../controllers/reimbursement.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Employee: submit + view own
router.post('/', (req, res, next) => reimbursement_controller_1.default.apply(req, res, next));
router.get('/my', (req, res, next) => reimbursement_controller_1.default.getMine(req, res, next));
// Manager: view pending team reimbursements + approve/reject
router.get('/pending-team', (req, res, next) => reimbursement_controller_1.default.getPendingForManager(req, res, next));
router.patch('/:id/action', (req, res, next) => reimbursement_controller_1.default.action(req, res, next));
// HR: view all
router.get('/', (0, rbac_1.authorize)('HR', 'HR_MANAGER'), (req, res, next) => reimbursement_controller_1.default.getAllHR(req, res, next));
exports.default = router;
//# sourceMappingURL=reimbursement.routes.js.map