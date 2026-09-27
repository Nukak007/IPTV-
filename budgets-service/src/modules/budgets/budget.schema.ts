import { z } from 'zod';

export const budgetPeriodEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

// ── Schema: crear presupuesto ────────────────────────────────────────────────
export const createBudgetSchema = z.object({
  category: z
    .string({ required_error: 'La categoría es requerida' })
    .min(1, 'La categoría no puede estar vacía')
    .max(50, 'La categoría no puede superar los 50 caracteres'),
  limitAmount: z
    .number({ required_error: 'El monto límite es requerido' })
    .positive('El monto límite debe ser mayor a 0'),
  period: budgetPeriodEnum.default('MONTHLY'),
  startDate: z.string().datetime({ message: 'startDate debe ser ISO 8601' }).optional(),
  endDate: z.string().datetime({ message: 'endDate debe ser ISO 8601' }).optional(),
});

export type CreateBudgetDto = z.infer<typeof createBudgetSchema>;

// ── Schema: actualizar presupuesto (parcial) ─────────────────────────────────
export const updateBudgetSchema = createBudgetSchema.partial();
export type UpdateBudgetDto = z.infer<typeof updateBudgetSchema>;

// ── Schema: params de ID ─────────────────────────────────────────────────────
export const budgetIdParamSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export type BudgetIdParam = z.infer<typeof budgetIdParamSchema>;

// ── Schema: query params para listado ─────────────────────────────────────────
export const listBudgetsQuerySchema = z.object({
  category: z.string().optional(),
  period: budgetPeriodEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
