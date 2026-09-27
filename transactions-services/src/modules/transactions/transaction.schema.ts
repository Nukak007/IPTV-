import { z } from 'zod';

// ── Tipos base ────────────────────────────────────────────────────────────────

export const TxTypeEnum = z.enum(['INCOME', 'EXPENSE']);
export type TxType = z.infer<typeof TxTypeEnum>;

// ── Schema: crear transacción ─────────────────────────────────────────────────

export const createTransactionSchema = z.object({
  amount: z
    .number({ required_error: 'El monto es requerido' })
    .positive('El monto debe ser mayor a 0'),
  type: TxTypeEnum.default('EXPENSE'),
  description: z.string().max(255).optional(),
  date: z
    .string({ required_error: 'La fecha es requerida' })
    .datetime({ message: 'La fecha debe ser una fecha ISO válida (ej: 2024-03-15T10:00:00Z)' }),
  categoryId: z.string({ required_error: 'La categoría es requerida' }).cuid(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

// ── Schema: actualizar transacción (todos los campos opcionales) ───────────────

export const updateTransactionSchema = createTransactionSchema.partial();
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

// ── Schema: filtros de listado ────────────────────────────────────────────────

export const listTransactionsQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  type: TxTypeEnum.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

// ── Schema: params de ID ──────────────────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export type IdParam = z.infer<typeof idParamSchema>;
