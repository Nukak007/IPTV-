import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Middleware factory que valida una parte del Request con un schema Zod.
 * Lanza ZodError si la validación falla (capturado por errorHandler).
 */
export function validateRequest(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(result.error);
      return;
    }

    if (part === 'query') {
      try {
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          configurable: true,
        });
      } catch {
        Object.assign(req.query, result.data);
      }
    } else {
      (req as any)[part] = result.data;
    }

    next();
  };
}
