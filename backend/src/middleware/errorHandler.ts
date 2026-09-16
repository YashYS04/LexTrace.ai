import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('[Error] Server error encountered:', err.message);

  const statusCode = (err as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred during document processing.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: (err as any).code || 'INTERNAL_ERROR',
    },
  });
}
