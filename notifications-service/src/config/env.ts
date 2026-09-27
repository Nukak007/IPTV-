import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3004),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida'),
  BUDGETS_SERVICE_URL: z.string().url().default('http://localhost:3003'),
  DEFAULT_ALERT_THRESHOLD: z.coerce.number().positive().default(1.0),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
