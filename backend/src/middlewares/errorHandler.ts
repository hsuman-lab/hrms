import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Prisma unique constraint violation
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json({ success: false, error: 'Record already exists' });
    return;
  }

  // Prisma record not found
  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({ success: false, error: 'Record not found' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
};
