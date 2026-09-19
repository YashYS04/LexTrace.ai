"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = rateLimiter;
const env_1 = require("../config/env");
const clientMap = new Map();
function rateLimiter(req, res, next) {
    // Bypass in test environment
    if (env_1.env.NODE_ENV === 'test') {
        return next();
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = env_1.env.RATE_LIMIT_WINDOW_MS;
    const maxRequests = env_1.env.RATE_LIMIT_MAX_REQUESTS;
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
