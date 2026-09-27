import { NotificationRepository } from './notification.repository';
import {
  TransactionEventDto,
  ListNotificationsQuery,
  UpdateNotificationDto,
} from './notification.schema';
import {
  Notification,
  PaginatedNotifications,
  OverspendCheckResult,
} from './notification.types';
import { BudgetClient } from '../../lib/budgetClient';
import { AppError } from '../../middlewares/errorHandler';

export class NotificationService {
  private readonly repository: NotificationRepository;
  private readonly budgetClient: BudgetClient;

  constructor(
    repository: NotificationRepository = new NotificationRepository(),
    budgetClient: BudgetClient = new BudgetClient(),
  ) {
    this.repository = repository;
    this.budgetClient = budgetClient;
  }

  async processTransactionEvent(dto: TransactionEventDto): Promise<OverspendCheckResult> {
    // 1. Ignorar ingresos
    if (dto.type === 'INCOME') {
      return {
        alertGenerated: false,
        reason: 'Las transacciones de tipo INCOME no generan alertas de sobregasto',
      };
    }

    // 2. Obtener límite del presupuesto
    let budgetLimit: number | undefined = dto.budgetLimit;

    if (budgetLimit === undefined) {
      const remoteBudget = await this.budgetClient.getBudgetByCategory(dto.category);
      if (remoteBudget && typeof remoteBudget.limitAmount === 'number') {
        budgetLimit = remoteBudget.limitAmount;
      }
    }

    if (budgetLimit === undefined || budgetLimit <= 0) {
      return {
        alertGenerated: false,
        reason: `No se encontró un presupuesto configurado para la categoría "${dto.category}"`,
      };
    }

    // 3. Calcular gasto acumulado total
    // Si se pasa currentSpent, representa el gasto previo acumulado al cual se suma la transacción actual
    const previousSpent = dto.currentSpent ?? 0;
    const totalSpent = Number((previousSpent + dto.amount).toFixed(2));
    const percentage = Number(((totalSpent / budgetLimit) * 100).toFixed(2));
    const threshold = dto.thresholdPercentage ?? 100;
    const excessAmount = totalSpent > budgetLimit ? Number((totalSpent - budgetLimit).toFixed(2)) : 0;

    const metrics = {
      category: dto.category,
      budgetLimit,
      currentSpent: totalSpent,
      percentage,
      thresholdPercentage: threshold,
      excessAmount,
    };

    // 4. Evaluar si se debe generar alerta
    if (percentage >= threshold) {
      const isOverspend = percentage >= 100;
      const type = isOverspend ? 'OVERSPEND_ALERT' : 'BUDGET_WARNING';
      const title = isOverspend
        ? `¡Alerta de Sobregasto en ${dto.category}!`
        : `Aviso: Presupuesto de ${dto.category} al ${percentage}%`;

      const message = isOverspend
        ? `Has superado el límite de presupuesto para "${dto.category}". Límite: $${budgetLimit.toFixed(2)}, Gasto acumulado: $${totalSpent.toFixed(2)} (${percentage}%). Exceso: $${excessAmount.toFixed(2)}.`
        : `Has alcanzado el ${percentage}% de tu presupuesto para "${dto.category}". Límite: $${budgetLimit.toFixed(2)}, Gasto acumulado: $${totalSpent.toFixed(2)}.`;

      const notification = await this.repository.create({
        type,
        title,
        message,
        category: dto.category,
        transactionId: dto.transactionId,
        amount: dto.amount,
        budgetLimit,
        currentSpent: totalSpent,
        excessAmount,
        percentage,
        isRead: false,
      });

      return {
        alertGenerated: true,
        notification,
        metrics,
      };
    }

    return {
      alertGenerated: false,
      reason: 'Gasto dentro del límite presupuestario',
      metrics,
    };
  }

  async findAll(query: ListNotificationsQuery): Promise<PaginatedNotifications> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.repository.findMany({
        category: query.category,
        isRead: query.isRead,
        type: query.type,
        skip,
        take: limit,
      }),
      this.repository.count({
        category: query.category,
        isRead: query.isRead,
        type: query.type,
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

  async findById(id: string): Promise<Notification> {
    const notification = await this.repository.findById(id);

    if (!notification) {
      throw new AppError(404, `Notificación con ID "${id}" no encontrada`);
    }

    return notification;
  }

  async markAsRead(id: string, isRead: boolean = true): Promise<Notification> {
    await this.findById(id);
    return this.repository.update(id, { isRead });
  }

  async update(id: string, dto: UpdateNotificationDto): Promise<Notification> {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
