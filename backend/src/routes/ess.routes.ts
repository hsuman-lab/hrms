import { Router } from 'express';
import essController from '../controllers/ess.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Addresses
router.get('/addresses',         (req, res, next) => essController.getAddresses(req, res, next));
router.put('/addresses',         (req, res, next) => essController.upsertAddress(req, res, next));

// Bank details
router.get('/bank',              (req, res, next) => essController.getBankDetail(req, res, next));
router.put('/bank',              (req, res, next) => essController.upsertBankDetail(req, res, next));

// Emergency contacts
router.get('/emergency-contacts',          (req, res, next) => essController.getEmergencyContacts(req, res, next));
router.post('/emergency-contacts',         (req, res, next) => essController.addEmergencyContact(req, res, next));
router.put('/emergency-contacts/:id',      (req, res, next) => essController.updateEmergencyContact(req, res, next));
router.delete('/emergency-contacts/:id',   (req, res, next) => essController.deleteEmergencyContact(req, res, next));

// Documents
router.get('/documents',         (req, res, next) => essController.getDocuments(req, res, next));
router.post('/documents',        (req, res, next) => essController.addDocument(req, res, next));
router.delete('/documents/:id',  (req, res, next) => essController.deleteDocument(req, res, next));

export default router;
