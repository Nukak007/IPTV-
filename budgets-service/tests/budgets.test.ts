import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp();

beforeEach(async () => {
  await prisma.budget.deleteMany();
});

describe('GET /api/v1/health', () => {
  it('devuelve status ok y nombre del servicio', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('budgets-service');
  });
});

describe('POST /api/v1/budgets', () => {
  it('crea un presupuesto exitosamente con categoría, monto límite y periodo', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .send({
        category: 'Alimentación',
        limitAmount: 450.5,
        period: 'MONTHLY',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.category).toBe('Alimentación');
    expect(res.body.data.limitAmount).toBe(450.5);
    expect(res.body.data.period).toBe('MONTHLY');
  });

  it('usa MONTHLY como periodo por defecto si no se especifica', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .send({
        category: 'Transporte',
        limitAmount: 150,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.period).toBe('MONTHLY');
  });

  it('rechaza payload sin categoría (400)', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .send({
        limitAmount: 200,
        period: 'MONTHLY',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.errors).toHaveProperty('category');
  });

  it('rechaza monto límite menor o igual a cero (400)', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .send({
        category: 'Ocio',
        limitAmount: -10,
        period: 'WEEKLY',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.errors).toHaveProperty('limitAmount');
  });

  it('rechaza periodo inválido (400)', async () => {
    const res = await request(app)
      .post('/api/v1/budgets')
      .send({
        category: 'Servicios',
        limitAmount: 100,
        period: 'SEMESTRAL',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.errors).toHaveProperty('period');
  });

  it('rechaza presupuesto duplicado para misma categoría y periodo (409)', async () => {
    await request(app)
      .post('/api/v1/budgets')
      .send({
        category: 'Educación',
        limitAmount: 300,
        period: 'MONTHLY',
      });

    const res = await request(app)
      .post('/api/v1/budgets')
      .send({
        category: 'Educación',
        limitAmount: 500,
        period: 'MONTHLY',
      });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
  });
});

describe('GET /api/v1/budgets', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/budgets').send({
      category: 'Alimentación',
      limitAmount: 400,
      period: 'MONTHLY',
    });
    await request(app).post('/api/v1/budgets').send({
      category: 'Transporte',
      limitAmount: 100,
      period: 'WEEKLY',
    });
  });

  it('lista todos los presupuestos con metadatos de paginación', async () => {
    const res = await request(app).get('/api/v1/budgets');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  });

  it('permite filtrar por categoría', async () => {
    const res = await request(app).get('/api/v1/budgets?category=Alimentación');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe('Alimentación');
  });

  it('permite filtrar por periodo', async () => {
    const res = await request(app).get('/api/v1/budgets?period=WEEKLY');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].period).toBe('WEEKLY');
  });
});

describe('GET /api/v1/budgets/:id', () => {
  it('retorna el presupuesto por ID', async () => {
    const created = await request(app).post('/api/v1/budgets').send({
      category: 'Salud',
      limitAmount: 250,
      period: 'YEARLY',
    });

    const budgetId = created.body.data.id;

    const res = await request(app).get(`/api/v1/budgets/${budgetId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(budgetId);
    expect(res.body.data.category).toBe('Salud');
  });

  it('retorna 404 para un ID que no existe', async () => {
    const res = await request(app).get('/api/v1/budgets/claaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});

describe('PATCH /api/v1/budgets/:id', () => {
  it('actualiza el monto límite parcialmente', async () => {
    const created = await request(app).post('/api/v1/budgets').send({
      category: 'Gimnasio',
      limitAmount: 50,
      period: 'MONTHLY',
    });

    const budgetId = created.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/budgets/${budgetId}`)
      .send({ limitAmount: 70 });

    expect(res.status).toBe(200);
    expect(res.body.data.limitAmount).toBe(70);
    expect(res.body.data.category).toBe('Gimnasio');
  });
});

describe('DELETE /api/v1/budgets/:id', () => {
  it('elimina el presupuesto correctamente', async () => {
    const created = await request(app).post('/api/v1/budgets').send({
      category: 'Suscripciones',
      limitAmount: 30,
      period: 'MONTHLY',
    });

    const budgetId = created.body.data.id;

    const res = await request(app).delete(`/api/v1/budgets/${budgetId}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/api/v1/budgets/${budgetId}`);
    expect(check.status).toBe(404);
  });
});
