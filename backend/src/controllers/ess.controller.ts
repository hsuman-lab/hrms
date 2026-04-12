import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import essService from '../services/ess.service';
import prisma from '../config/database';

class EssController {
  private async getEmployeeId(req: AuthRequest): Promise<string> {
    const emp = await prisma.employee.findUnique({ where: { user_id: req.user!.userId }, select: { id: true } });
    if (!emp) throw Object.assign(new Error('Employee profile not found'), { statusCode: 404 });
    return emp.id;
  }

  // Addresses
  getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.getAddresses(empId) });
    } catch (e) { next(e); }
  };

  upsertAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.upsertAddress(empId, req.body) });
    } catch (e) { next(e); }
  };

  // Bank
  getBankDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.getBankDetail(empId) });
    } catch (e) { next(e); }
  };

  upsertBankDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.upsertBankDetail(empId, req.body) });
    } catch (e) { next(e); }
  };

  // Emergency Contacts
  getEmergencyContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.getEmergencyContacts(empId) });
    } catch (e) { next(e); }
  };

  addEmergencyContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await essService.addEmergencyContact(empId, req.body) });
    } catch (e) { next(e); }
  };

  updateEmergencyContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.updateEmergencyContact(req.params.id, empId, req.body) });
    } catch (e) { next(e); }
  };

  deleteEmergencyContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json(await essService.deleteEmergencyContact(req.params.id, empId));
    } catch (e) { next(e); }
  };

  // Documents
  getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json({ success: true, data: await essService.getDocuments(empId) });
    } catch (e) { next(e); }
  };

  addDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.status(201).json({ success: true, data: await essService.addDocument(empId, req.body) });
    } catch (e) { next(e); }
  };

  deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const empId = await this.getEmployeeId(req);
      res.json(await essService.deleteDocument(req.params.id, empId));
    } catch (e) { next(e); }
  };
}

export default new EssController();
