import { prisma } from '../../lib/prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './category.schema';
import { Category } from './category.types';

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { name } });
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
