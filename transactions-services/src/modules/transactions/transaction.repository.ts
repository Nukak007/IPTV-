import { prisma } from '../../lib/prisma';
import { CreateTransactionDto, UpdateTransactionDto, ListTransactionsQuery } from './transaction.schema';
import { TransactionWithCategory, PaginatedResult } from './transaction.types';

export class TransactionRepository {
  async create(data: CreateTransactionDto): Promise<TransactionWithCategory> {
    return prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: new Date(data.date),
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
  }

  async findById(id: string): Promise<TransactionWithCategory | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findMany(filters: ListTransactionsQuery): Promise<PaginatedResult<TransactionWithCategory>> {
    const { categoryId, type, from, to } = filters;
    // Coerce defensivamente — los valores pueden venir como strings del query string
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(from || to
        ? {
            date: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateTransactionDto): Promise<TransactionWithCategory> {
    return prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      include: { category: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }
}
