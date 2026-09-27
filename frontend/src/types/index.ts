export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Alimentación'
  | 'Vivienda'
  | 'Transporte'
  | 'Servicios'
  | 'Salario'
  | 'Inversiones'
  | 'Ocio'
  | 'Salud'
  | 'Educación'
  | 'Otros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory | string;
  date: string;
  status: 'completed' | 'pending';
  account?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
}
