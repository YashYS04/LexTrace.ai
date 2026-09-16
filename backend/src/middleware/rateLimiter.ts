import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface ClientRecord {
  count: number;
  resetAt: number;
}

const clientMap = new Map<string, ClientRecord>();

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  // Bypass in test environment
  if (env.NODE_ENV === 'test') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  let record = clientMap.get(ip);

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    clientMap.set(ip, record);
    return next();
  }

  record.count++;

  if (record.count > maxRequests) {
    res.status(429).json({
      success: false,
      error: {
        message: 'Rate limit exceeded. Please wait a moment before sending more requests.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
    return;
  }

  next();
}
