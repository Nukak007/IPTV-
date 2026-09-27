import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';

const service = new NotificationService();

// POST /api/v1/notifications/events/transaction
export async function processTransactionEvent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.processTransactionEvent(req.body);
    const statusCode = result.alertGenerated ? 201 : 200;
    res.status(statusCode).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/notifications
export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.findAll(req.query as any);
    res.json({
      status: 'success',
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/notifications/:id
export async function getNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const notification = await service.findById(req.params['id'] as string);
    res.json({ status: 'success', data: notification });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/notifications/:id/read
export async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const isRead = req.body.isRead !== undefined ? Boolean(req.body.isRead) : true;
    const notification = await service.markAsRead(req.params['id'] as string, isRead);
    res.json({ status: 'success', data: notification });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/notifications/:id
export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await service.remove(req.params['id'] as string);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
