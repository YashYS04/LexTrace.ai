import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import documentsRouter from './routes/documents';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app: Application = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiter
  app.use(rateLimiter);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'LexTrace AI Backend Engine',
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/documents', documentsRouter);

  // Centralized Error Boundary
  app.use(errorHandler);

  return app;
}
