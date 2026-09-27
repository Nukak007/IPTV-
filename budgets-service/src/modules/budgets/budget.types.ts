import { Budget } from '@prisma/client';

// Re-export del tipo de Prisma para uso interno
export type { Budget };

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
