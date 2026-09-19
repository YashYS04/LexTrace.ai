"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const documents_1 = __importDefault(require("./routes/documents"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    // Security headers
    app.use((0, helmet_1.default)());
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    // Body parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Global rate limiter
    app.use(rateLimiter_1.rateLimiter);
    // Health check
    const healthHandler = (req, res) => {
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
    app.use('/api/documents', documents_1.default);
    app.use('/documents', documents_1.default);
    // Centralized Error Boundary
    app.use(errorHandler_1.errorHandler);
    return app;
}
