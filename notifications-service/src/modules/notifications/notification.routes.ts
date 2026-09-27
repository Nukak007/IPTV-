import { Router } from 'express';
import {
  processTransactionEvent,
  listNotifications,
  getNotification,
  markNotificationAsRead,
  deleteNotification,
} from './notification.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  transactionEventSchema,
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  updateNotificationSchema,
} from './notification.schema';

export const notificationRoutes = Router();

// Evento de transacción para análisis de sobregasto
notificationRoutes.post(
  '/events/transaction',
  validateRequest(transactionEventSchema, 'body'),
  processTransactionEvent,
);

// Endpoints CRUD y consulta
notificationRoutes
  .route('/')
  .get(validateRequest(listNotificationsQuerySchema, 'query'), listNotifications);

notificationRoutes
  .route('/:id')
  .get(validateRequest(notificationIdParamSchema, 'params'), getNotification)
  .delete(validateRequest(notificationIdParamSchema, 'params'), deleteNotification);

notificationRoutes.patch(
  '/:id/read',
  validateRequest(notificationIdParamSchema, 'params'),
  validateRequest(updateNotificationSchema, 'body'),
  markNotificationAsRead,
);
