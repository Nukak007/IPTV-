import { env } from '../config/env';

export interface RemoteBudget {
  id: string;
  category: string;
  limitAmount: number;
  period: string;
  startDate?: string | null;
  endDate?: string | null;
}

export class BudgetClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = env.BUDGETS_SERVICE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getBudgetByCategory(category: string): Promise<RemoteBudget | null> {
    try {
      const url = `${this.baseUrl}/api/v1/budgets?category=${encodeURIComponent(category)}&limit=1`;
      const response = await fetch(url);

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as {
        status?: string;
        data?: RemoteBudget[];
      };

      if (body.status === 'success' && Array.isArray(body.data) && body.data.length > 0) {
        const found = body.data.find(
          (b) => b.category.toLowerCase() === category.toLowerCase(),
        );
        return found ?? body.data[0] ?? null;
      }

      return null;
    } catch (error) {
      console.warn(`[BudgetClient] No se pudo consultar budgets-service (${this.baseUrl}):`, error);
      return null;
    }
  }
}
