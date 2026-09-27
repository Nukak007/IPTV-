import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Error de validación Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Error de negocio conocido
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Error inesperado
  console.error('[ErrorHandler]', err);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
}
