import { z } from 'zod';

// ── Schema: crear categoría ───────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .min(1, 'El nombre no puede estar vacío')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  icon: z.string().max(10).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'El color debe ser un hex válido (ej: #FF6B6B)')
    .optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

// ── Schema: actualizar categoría (todos los campos opcionales) ────────────────

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

// ── Schema: params de ID ──────────────────────────────────────────────────────

export const categoryIdParamSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
