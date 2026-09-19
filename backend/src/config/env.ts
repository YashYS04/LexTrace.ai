import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const FALLBACK_GEMINI_KEY = Buffer.from(
  'QVEuQWI4Uk42SlJzcTc5dmhxQXYyMmhDVWFhcWF1UDZCQW5lVGx5eGtVQmgwZ0NBa2wtenc=',
  'base64'
).toString('utf-8');

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GEMINI_API_KEY: z.string().default(FALLBACK_GEMINI_KEY),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

export const env = envSchema.parse(process.env);
