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
      // req.query es read-only en Express 5 — mergeamos en el objeto existente
      Object.assign(req.query, result.data);
    } else {
      // body y params son escribibles
      (req as any)[part] = result.data;
    }

    next();
  };
}
