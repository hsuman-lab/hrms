"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ess_controller_1 = __importDefault(require("../controllers/ess.controller"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Addresses
router.get('/addresses', (req, res, next) => ess_controller_1.default.getAddresses(req, res, next));
router.put('/addresses', (req, res, next) => ess_controller_1.default.upsertAddress(req, res, next));
// Bank details
router.get('/bank', (req, res, next) => ess_controller_1.default.getBankDetail(req, res, next));
router.put('/bank', (req, res, next) => ess_controller_1.default.upsertBankDetail(req, res, next));
// Emergency contacts
router.get('/emergency-contacts', (req, res, next) => ess_controller_1.default.getEmergencyContacts(req, res, next));
router.post('/emergency-contacts', (req, res, next) => ess_controller_1.default.addEmergencyContact(req, res, next));
router.put('/emergency-contacts/:id', (req, res, next) => ess_controller_1.default.updateEmergencyContact(req, res, next));
router.delete('/emergency-contacts/:id', (req, res, next) => ess_controller_1.default.deleteEmergencyContact(req, res, next));
// Documents
router.get('/documents', (req, res, next) => ess_controller_1.default.getDocuments(req, res, next));
router.post('/documents', (req, res, next) => ess_controller_1.default.addDocument(req, res, next));
router.delete('/documents/:id', (req, res, next) => ess_controller_1.default.deleteDocument(req, res, next));
exports.default = router;
//# sourceMappingURL=ess.routes.js.map