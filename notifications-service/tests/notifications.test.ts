import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();

describe('notifications-service API', () => {
  beforeEach(async () => {
    await prisma.notification.deleteMany();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/health', () => {
    it('debe responder 200 con status ok', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('notifications-service');
    });
  });

  describe('POST /api/v1/notifications/events/transaction', () => {
    it('debe generar y persistir una alerta cuando el gasto supera el 100% del presupuesto', async () => {
      const payload = {
        transactionId: 'tx-101',
        category: 'Alimentación',
        amount: 150.0,
        currentSpent: 400.0,
        budgetLimit: 500.0,
      };

      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.alertGenerated).toBe(true);
      expect(res.body.data.notification).toBeDefined();
      expect(res.body.data.notification.category).toBe('Alimentación');
      expect(res.body.data.notification.type).toBe('OVERSPEND_ALERT');
      expect(res.body.data.notification.currentSpent).toBe(550.0);
      expect(res.body.data.notification.budgetLimit).toBe(500.0);
      expect(res.body.data.notification.excessAmount).toBe(50.0);
      expect(res.body.data.notification.percentage).toBe(110.0);
      expect(res.body.data.notification.isRead).toBe(false);

      // Verificar persistencia en base de datos
      const stored = await prisma.notification.findUnique({
        where: { id: res.body.data.notification.id },
      });
      expect(stored).not.toBeNull();
      expect(stored?.percentage).toBe(110.0);
    });

    it('debe generar aviso cuando se supera el umbral configurado (ej: 80%)', async () => {
      const payload = {
        transactionId: 'tx-102',
        category: 'Entretenimiento',
        amount: 85.0,
        currentSpent: 0,
        budgetLimit: 100.0,
        thresholdPercentage: 80,
      };

      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.alertGenerated).toBe(true);
      expect(res.body.data.notification.type).toBe('BUDGET_WARNING');
      expect(res.body.data.notification.percentage).toBe(85.0);
    });

    it('no debe generar alerta cuando el gasto está dentro del límite presupuestario', async () => {
      const payload = {
        transactionId: 'tx-103',
        category: 'Transporte',
        amount: 30.0,
        currentSpent: 50.0,
        budgetLimit: 200.0,
      };

      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.alertGenerated).toBe(false);
      expect(res.body.data.metrics.percentage).toBe(40.0);

      // Verificar que no se guardó notificación
      const count = await prisma.notification.count();
      expect(count).toBe(0);
    });

    it('debe consultar presupuestos a budgets-service si no se incluye budgetLimit en el payload', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [{ id: 'b-1', category: 'Alimentación', limitAmount: 300, period: 'MONTHLY' }],
        }),
      } as Response);

      const payload = {
        category: 'Alimentación',
        amount: 350.0,
      };

      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.alertGenerated).toBe(true);
      expect(res.body.data.notification.budgetLimit).toBe(300);
    });

    it('debe retornar alertGenerated: false si no se encuentra presupuesto remoto ni local', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
      } as Response);

      const payload = {
        category: 'Inexistente',
        amount: 100.0,
      };

      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.alertGenerated).toBe(false);
      expect(res.body.data.reason).toContain('No se encontró un presupuesto');
    });

    it('debe ignorar transacciones de tipo INCOME sin generar alertas', async () => {
      const payload = {
        category: 'Salario',
        amount: 1500.0,
        type: 'INCOME',
      };

      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.alertGenerated).toBe(false);
      expect(res.body.data.reason).toContain('INCOME');
    });

    it('debe responder 400 si faltan campos obligatorios o son inválidos', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/events/transaction')
        .send({
          category: '',
          amount: -20,
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Consultas y CRUD de Notificaciones', () => {
    beforeEach(async () => {
      await prisma.notification.createMany({
        data: [
          {
            type: 'OVERSPEND_ALERT',
            title: 'Sobregasto en Alimentación',
            message: 'Has superado el límite',
            category: 'Alimentación',
            budgetLimit: 500,
            currentSpent: 550,
            percentage: 110,
            isRead: false,
          },
          {
            type: 'BUDGET_WARNING',
            title: 'Aviso en Transporte',
            message: 'Cerca del límite',
            category: 'Transporte',
            budgetLimit: 200,
            currentSpent: 180,
            percentage: 90,
            isRead: true,
          },
        ],
      });
    });

    it('GET /api/v1/notifications debe listar las alertas paginadas', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('GET /api/v1/notifications con filtro isRead=false', async () => {
      const res = await request(app).get('/api/v1/notifications?isRead=false');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('Alimentación');
    });

    it('GET /api/v1/notifications/:id debe devolver la alerta solicitada', async () => {
      const [item] = await prisma.notification.findMany();
      const res = await request(app).get(`/api/v1/notifications/${item.id}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBe(item.id);
    });

    it('GET /api/v1/notifications/:id debe responder 404 si el ID no existe', async () => {
      const res = await request(app).get('/api/v1/notifications/cjld2cjxh0000qzrmn831i7rn');
      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
    });

    it('PATCH /api/v1/notifications/:id/read debe marcar la alerta como leída', async () => {
      const item = await prisma.notification.findFirst({ where: { isRead: false } });
      const res = await request(app)
        .patch(`/api/v1/notifications/${item!.id}/read`)
        .send({ isRead: true });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.isRead).toBe(true);

      const updated = await prisma.notification.findUnique({ where: { id: item!.id } });
      expect(updated?.isRead).toBe(true);
    });

    it('PATCH /api/v1/notifications/:id/read debe responder 404 si no existe', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/cjld2cjxh0000qzrmn831i7rn/read')
        .send({ isRead: true });
      expect(res.status).toBe(404);
    });

    it('DELETE /api/v1/notifications/:id debe eliminar la notificación', async () => {
      const [item] = await prisma.notification.findMany();
      const res = await request(app).delete(`/api/v1/notifications/${item.id}`);

      expect(res.status).toBe(204);
      const exists = await prisma.notification.findUnique({ where: { id: item.id } });
      expect(exists).toBeNull();
    });

    it('DELETE /api/v1/notifications/:id debe responder 404 si no existe', async () => {
      const res = await request(app).delete('/api/v1/notifications/cjld2cjxh0000qzrmn831i7rn');
      expect(res.status).toBe(404);
    });
  });
});
