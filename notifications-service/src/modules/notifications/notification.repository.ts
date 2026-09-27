import { prisma } from '../../lib/prisma';
import { CreateNotificationDto, UpdateNotificationDto } from './notification.schema';
import { Notification } from './notification.types';

export interface NotificationFindManyFilters {
  category?: string;
  isRead?: boolean | string;
  type?: string;
  skip?: number;
  take?: number;
}

export class NotificationRepository {
  async findMany(filters: NotificationFindManyFilters): Promise<Notification[]> {
    const { category, isRead, type, skip, take } = filters;
    const parsedIsRead =
      isRead === undefined
        ? undefined
        : typeof isRead === 'string'
          ? isRead === 'true'
          : Boolean(isRead);

    return prisma.notification.findMany({
      where: {
        ...(category && { category: { contains: category } }),
        ...(parsedIsRead !== undefined && { isRead: parsedIsRead }),
        ...(type && { type }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(filters: Pick<NotificationFindManyFilters, 'category' | 'isRead' | 'type'>): Promise<number> {
    const { category, isRead, type } = filters;
    const parsedIsRead =
      isRead === undefined
        ? undefined
        : typeof isRead === 'string'
          ? isRead === 'true'
          : Boolean(isRead);

    return prisma.notification.count({
      where: {
        ...(category && { category: { contains: category } }),
        ...(parsedIsRead !== undefined && { isRead: parsedIsRead }),
        ...(type && { type }),
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({ where: { id } });
  }

  async create(data: CreateNotificationDto): Promise<Notification> {
    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        category: data.category,
        transactionId: data.transactionId ?? null,
        amount: data.amount ?? null,
        budgetLimit: data.budgetLimit,
        currentSpent: data.currentSpent,
        excessAmount: data.excessAmount ?? null,
        percentage: data.percentage,
        isRead: data.isRead ?? false,
      },
    });
  }

  async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: {
        ...(data.isRead !== undefined && { isRead: data.isRead }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({ where: { id } });
  }
}
