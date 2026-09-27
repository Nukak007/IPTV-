import { prisma } from '../../lib/prisma';
import { CreateBudgetDto, UpdateBudgetDto } from './budget.schema';
import { Budget } from './budget.types';

export interface BudgetFindManyFilters {
  category?: string;
  period?: string;
  skip?: number;
  take?: number;
}

export class BudgetRepository {
  async findMany(filters: BudgetFindManyFilters): Promise<Budget[]> {
    const { category, period, skip, take } = filters;
    return prisma.budget.findMany({
      where: {
        ...(category && { category: { contains: category } }),
        ...(period && { period }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(filters: Pick<BudgetFindManyFilters, 'category' | 'period'>): Promise<number> {
    const { category, period } = filters;
    return prisma.budget.count({
      where: {
        ...(category && { category: { contains: category } }),
        ...(period && { period }),
      },
    });
  }

  async findById(id: string): Promise<Budget | null> {
    return prisma.budget.findUnique({ where: { id } });
  }

  async findByCategoryAndPeriod(category: string, period: string): Promise<Budget | null> {
    return prisma.budget.findFirst({
      where: {
        category,
        period,
      },
    });
  }

  async create(data: CreateBudgetDto): Promise<Budget> {
    return prisma.budget.create({
      data: {
        category: data.category,
        limitAmount: data.limitAmount,
        period: data.period,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async update(id: string, data: UpdateBudgetDto): Promise<Budget> {
    return prisma.budget.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category }),
        ...(data.limitAmount !== undefined && { limitAmount: data.limitAmount }),
        ...(data.period !== undefined && { period: data.period }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.budget.delete({ where: { id } });
  }
}
