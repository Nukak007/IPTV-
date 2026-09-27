import express, { Application } from 'express';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { errorHandler } from './middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  // ── Middlewares globales ───────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'notifications-service',
      timestamp: new Date().toISOString(),
    });
  });

  // ── Rutas de la API ───────────────────────────────────────────────────────
  app.use('/api/v1/notifications', notificationRoutes);

  // ── Manejador de errores (debe ir al final) ────────────────────────────────
  app.use(errorHandler);

  return app;
}
