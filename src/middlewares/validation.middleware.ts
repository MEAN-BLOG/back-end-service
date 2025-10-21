import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

/**
 * Middleware to validate request body, query, or params using a Zod schema
 * @template T - Output type of the schema
 * @param schema - Zod schema to validate against
 * @param type - 'body', 'query', or 'params' (default 'body')
 */
export function validate<T>(schema: ZodType<T>, type: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[type];
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string[]> = {};

      const zodError = result.error;
      zodError.issues.forEach((issue) => {
        const key = issue.path.join('.') || 'field';
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
      });
    }

    req[type] = result.data;
    next();
  };
}
