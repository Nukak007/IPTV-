import { TransactionRepository } from './transaction.repository';
import { CreateTransactionDto, UpdateTransactionDto, ListTransactionsQuery } from './transaction.schema';
import { TransactionWithCategory, PaginatedResult } from './transaction.types';
import { AppError } from '../../middlewares/errorHandler';
import { prisma } from '../../lib/prisma';

export class TransactionService {
  private readonly repository: TransactionRepository;

  constructor() {
    this.repository = new TransactionRepository();
  }

  async create(dto: CreateTransactionDto): Promise<TransactionWithCategory> {
    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new AppError(404, `Categoría con ID "${dto.categoryId}" no encontrada`);
    }

    return this.repository.create(dto);
  }

  async findById(id: string): Promise<TransactionWithCategory> {
    const transaction = await this.repository.findById(id);

    if (!transaction) {
      throw new AppError(404, `Transacción con ID "${id}" no encontrada`);
    }

    return transaction;
  }

  async findMany(query: ListTransactionsQuery): Promise<PaginatedResult<TransactionWithCategory>> {
    return this.repository.findMany(query);
  }

  async update(id: string, dto: UpdateTransactionDto): Promise<TransactionWithCategory> {
    // Verificar que la transacción existe
    await this.findById(id);

    // Si se cambia la categoría, verificar que la nueva existe
    if (dto.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new AppError(404, `Categoría con ID "${dto.categoryId}" no encontrada`);
      }
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // Verifica que existe antes de borrar
    await this.repository.delete(id);
  }
}
