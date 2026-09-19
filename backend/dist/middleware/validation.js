"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dossierRequestSchema = exports.chatRequestSchema = exports.compareRequestSchema = exports.auditRequestSchema = void 0;
exports.validateBody = validateBody;
const zod_1 = require("zod");
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid request payload',
                    details: result.error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
                },
            });
            return;
        }
        req.body = result.data;
        next();
    };
}
exports.auditRequestSchema = zod_1.z.object({
    text: zod_1.z.string().min(20, 'Document text must be at least 20 characters long'),
    fileName: zod_1.z.string().default('Untitled_Contract.txt'),
    persona: zod_1.z.enum(['Freelancer', 'Tenant', 'Employee', 'SmallBusiness', 'All']).default('Freelancer'),
});
exports.compareRequestSchema = zod_1.z.object({
    doc1Text: zod_1.z.string().min(20, 'Document 1 text must be at least 20 characters'),
    doc1Name: zod_1.z.string().default('Version 1'),
    doc2Text: zod_1.z.string().min(20, 'Document 2 text must be at least 20 characters'),
    doc2Name: zod_1.z.string().default('Version 2'),
});
exports.chatRequestSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, 'Question cannot be empty'),
    documentText: zod_1.z.string().optional().default(''),
});
exports.dossierRequestSchema = zod_1.z.object({
    documentText: zod_1.z.string().min(20, 'Document text is required to generate consultation brief'),
    documentTitle: zod_1.z.string().default('Contract Review Brief'),
    persona: zod_1.z.enum(['Freelancer', 'Tenant', 'Employee', 'SmallBusiness', 'All']).default('Freelancer'),
});
