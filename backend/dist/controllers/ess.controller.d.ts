import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
declare class EssController {
    private getEmployeeId;
    getAddresses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    upsertAddress: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getBankDetail: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    upsertBankDetail: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getEmergencyContacts: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    addEmergencyContact: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateEmergencyContact: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteEmergencyContact: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getDocuments: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    addDocument: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteDocument: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: EssController;
export default _default;
//# sourceMappingURL=ess.controller.d.ts.map