import { BudgetRepository } from './budget.repository';
import { CreateBudgetDto, ListBudgetsQuery, UpdateBudgetDto } from './budget.schema';
import { Budget } from './budget.types';
import { AppError } from '../../middlewares/errorHandler';

export interface PaginatedBudgets {
  items: Budget[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class BudgetService {
  private readonly repository: BudgetRepository;

  constructor() {
    this.repository = new BudgetRepository();
  }

  async findAll(query: ListBudgetsQuery): Promise<PaginatedBudgets> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.repository.findMany({
        category: query.category,
        period: query.period,
        skip,
        take: limit,
      }),
      this.repository.count({
        category: query.category,
        period: query.period,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: string): Promise<Budget> {
    const budget = await this.repository.findById(id);

    if (!budget) {
      throw new AppError(404, `Presupuesto con ID "${id}" no encontrado`);
    }

    return budget;
  }

  async create(dto: CreateBudgetDto): Promise<Budget> {
    const existing = await this.repository.findByCategoryAndPeriod(dto.category, dto.period);

    if (existing) {
      throw new AppError(
        409,
        `Ya existe un presupuesto para la categoría "${dto.category}" con periodo "${dto.period}"`,
      );
    }

    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateBudgetDto): Promise<Budget> {
    const current = await this.findById(id);

    const newCategory = dto.category ?? current.category;
    const newPeriod = dto.period ?? current.period;

    if (dto.category || dto.period) {
      const existing = await this.repository.findByCategoryAndPeriod(newCategory, newPeriod);
      if (existing && existing.id !== id) {
        throw new AppError(
          409,
          `Ya existe un presupuesto para la categoría "${newCategory}" con periodo "${newPeriod}"`,
        );
      }
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
