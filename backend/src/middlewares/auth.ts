import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AuthRequest, AuthPayload } from '../types';
import prisma from '../config/database';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret) as AuthPayload;

    const user = await prisma.user.findUnique({
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
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
