import { Transaction, Category } from '@prisma/client';

// Re-export de tipos de Prisma para uso interno
export type { Transaction, Category };

// Tipo de transacción como union string literal (compatible con SQLite)
export type TxType = 'INCOME' | 'EXPENSE';

// Transacción con la relación de categoría incluida
export type TransactionWithCategory = Transaction & {
  category: Category;
};

// Respuesta paginada genérica
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
