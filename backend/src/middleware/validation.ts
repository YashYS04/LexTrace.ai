import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
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

export const auditRequestSchema = z.object({
  text: z.string().min(20, 'Document text must be at least 20 characters long'),
  fileName: z.string().default('Untitled_Contract.txt'),
  persona: z.enum(['Freelancer', 'Tenant', 'Employee', 'SmallBusiness', 'All']).default('Freelancer'),
});

export const compareRequestSchema = z.object({
  doc1Text: z.string().min(20, 'Document 1 text must be at least 20 characters'),
  doc1Name: z.string().default('Version 1'),
  doc2Text: z.string().min(20, 'Document 2 text must be at least 20 characters'),
  doc2Name: z.string().default('Version 2'),
});

export const chatRequestSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  documentText: z.string().min(20, 'Document text is required to ground the answer'),
});

export const dossierRequestSchema = z.object({
  documentText: z.string().min(20, 'Document text is required to generate consultation brief'),
  documentTitle: z.string().default('Contract Review Brief'),
  persona: z.enum(['Freelancer', 'Tenant', 'Employee', 'SmallBusiness', 'All']).default('Freelancer'),
});
