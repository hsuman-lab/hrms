import { Response, NextFunction } from 'express';
import { AuthRequest, RoleName } from '../types';
export declare const authorize: (...roles: RoleName[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.d.ts.map