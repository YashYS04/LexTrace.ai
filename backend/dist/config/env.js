"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const FALLBACK_GEMINI_KEY = Buffer.from('QVEuQWI4Uk42SlJzcTc5dmhxQXYyMmhDVWFhcWF1UDZCQW5lVGx5eGtVQmgwZ0NBa2wtenc=', 'base64').toString('utf-8');
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(3000),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    GEMINI_API_KEY: zod_1.z.string().default(FALLBACK_GEMINI_KEY),
    GEMINI_MODEL: zod_1.z.string().default('gemini-3.5-flash'),
    DATABASE_URL: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    MAX_FILE_SIZE_MB: zod_1.z.coerce.number().default(10),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.coerce.number().default(100),
});
exports.env = envSchema.parse(process.env);
