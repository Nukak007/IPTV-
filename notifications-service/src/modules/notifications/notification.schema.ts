import { z } from 'zod';

export const notificationTypeEnum = z.enum(['OVERSPEND_ALERT', 'BUDGET_WARNING', 'SYSTEM']);
export const transactionTypeEnum = z.enum(['EXPENSE', 'INCOME']);

// ── Schema: Evento de nueva transacción ──────────────────────────────────────
export const transactionEventSchema = z.object({
  transactionId: z.string().optional(),
  category: z
    .string({ required_error: 'La categoría es requerida' })
    .min(1, 'La categoría no puede estar vacía'),
  amount: z
    .number({ required_error: 'El monto es requerido' })
    .positive('El monto debe ser mayor a 0'),
  type: transactionTypeEnum.default('EXPENSE'),
  date: z.string().datetime({ message: 'date debe ser ISO 8601' }).optional(),
  description: z.string().optional(),
  /// Gasto acumulado previo antes de esta transacción
  currentSpent: z.number().nonnegative().optional(),
  /// Límite de presupuesto manual (si no se especifica, se consulta a budgets-service)
  budgetLimit: z.number().positive().optional(),
  /// Umbral de alerta en porcentaje (ej: 100 para 100%, 80 para 80%). Default: 100
  thresholdPercentage: z.number().positive().default(100),
});

export type TransactionEventDto = z.infer<typeof transactionEventSchema>;

// ── Schema: Crear notificación directa ────────────────────────────────────────
export const createNotificationSchema = z.object({
  type: notificationTypeEnum.default('OVERSPEND_ALERT'),
  title: z.string().min(1, 'El título es requerido'),
  message: z.string().min(1, 'El mensaje es requerido'),
  category: z.string().min(1, 'La categoría es requerida'),
  transactionId: z.string().optional(),
  amount: z.number().positive().optional(),
  budgetLimit: z.number().positive('El límite de presupuesto debe ser mayor a 0'),
  currentSpent: z.number().nonnegative('El gasto actual no puede ser negativo'),
  excessAmount: z.number().optional(),
  percentage: z.number().positive(),
  isRead: z.boolean().default(false),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

// ── Schema: Actualizar notificación ──────────────────────────────────────────
export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
});

export type UpdateNotificationDto = z.infer<typeof updateNotificationSchema>;

// ── Schema: ID Param ──────────────────────────────────────────────────────────
export const notificationIdParamSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;

// ── Schema: Query de listado ─────────────────────────────────────────────────
export const listNotificationsQuerySchema = z.object({
  category: z.string().optional(),
  isRead: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional()),
  type: notificationTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
