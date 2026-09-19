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
  const healthHandler = (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'LexTrace AI Backend Engine',
      version: '1.0.0',
    });
  };

  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);
  app.get('/api', healthHandler);
  app.get('/', healthHandler);

  // API Routes (mounted with and without /api prefix for serverless compatibility)
  app.use('/api/documents', documentsRouter);
  app.use('/documents', documentsRouter);

  // Centralized Error Boundary
  app.use(errorHandler);

  return app;
}
