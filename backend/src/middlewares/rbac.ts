import { Response, NextFunction } from 'express';
import { AuthRequest, RoleName } from '../types';

export const authorize = (...roles: RoleName[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role as RoleName)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};
