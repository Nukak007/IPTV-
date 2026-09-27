import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('devuelve status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('transactions-service');
  });
});

// ─── Categories ───────────────────────────────────────────────────────────────

describe('GET /api/v1/categories', () => {
  it('devuelve lista de categorías', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/v1/categories', () => {
  it('crea una categoría con datos válidos', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Mascota', icon: '🐶', color: '#A8D8A8' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Mascota');
    expect(res.body.data.icon).toBe('🐶');
  });

  it('rechaza payload sin nombre', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ icon: '🐶' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.errors).toHaveProperty('name');
  });

  it('rechaza color con formato inválido', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Test', color: 'rojo' });

    expect(res.status).toBe(400);
  });

  it('rechaza nombre duplicado (409)', async () => {
    await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Duplicada' });

    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Duplicada' });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/v1/categories/:id', () => {
  let catId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Cat-GetById', icon: '🔍' });
    catId = res.body.data.id;
  });

  it('retorna la categoría por ID', async () => {
    const res = await request(app).get(`/api/v1/categories/${catId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(catId);
  });

  it('retorna 404 para ID inexistente', async () => {
    const res = await request(app).get('/api/v1/categories/claaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/categories/:id', () => {
  let catId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Cat-Patch', icon: '✏️' });
    catId = res.body.data.id;
  });

  it('actualiza el nombre de una categoría', async () => {
    const res = await request(app)
      .patch(`/api/v1/categories/${catId}`)
      .send({ name: 'Cat-Patch-Actualizada', color: '#123456' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Cat-Patch-Actualizada');
    expect(res.body.data.color).toBe('#123456');
  });

  it('retorna 404 al parchear ID inexistente', async () => {
    const res = await request(app)
      .patch('/api/v1/categories/claaaaaaaaaaaaaaaaaaaaaaaaa')
      .send({ name: 'No existe' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/categories/:id', () => {
  it('elimina una categoría existente', async () => {
    const created = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Cat-Delete' });

    const catId = created.body.data.id;
    const res = await request(app).delete(`/api/v1/categories/${catId}`);

    expect(res.status).toBe(204);
  });

  it('retorna 404 al eliminar ID inexistente', async () => {
    const res = await request(app).delete('/api/v1/categories/claaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(res.status).toBe(404);
  });
});

// ─── Transactions ─────────────────────────────────────────────────────────────

describe('POST /api/v1/transactions', () => {
  let categoryId: string;

  beforeAll(() => {
    categoryId = (global as any).testCategoryId;
  });

  it('crea una transacción con datos válidos', async () => {
    const payload = {
      amount: 25000,
      type: 'EXPENSE',
      description: 'Almuerzo en restaurante',
      date: '2024-03-15T12:00:00.000Z',
      categoryId,
    };

    const res = await request(app).post('/api/v1/transactions').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(Number(res.body.data.amount)).toBe(25000); // Float en SQLite, Decimal en PostgreSQL
    expect(res.body.data.type).toBe('EXPENSE');
    expect(res.body.data.category.id).toBe(categoryId);
  });

  it('rechaza payload sin monto', async () => {
    const res = await request(app).post('/api/v1/transactions').send({
      type: 'EXPENSE',
      date: '2024-03-15T12:00:00.000Z',
      categoryId,
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.errors).toHaveProperty('amount');
  });

  it('rechaza monto negativo', async () => {
    const res = await request(app).post('/api/v1/transactions').send({
      amount: -100,
      date: '2024-03-15T12:00:00.000Z',
      categoryId,
    });

    expect(res.status).toBe(400);
  });

  it('rechaza categoría inexistente', async () => {
    const res = await request(app).post('/api/v1/transactions').send({
      amount: 50000,
      date: '2024-03-15T12:00:00.000Z',
      categoryId: 'claaaaaaaaaaaaaaaaaaaaaaaaa', // ID válido pero inexistente
    });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/transactions', () => {
  it('devuelve lista paginada de transacciones', async () => {
    const res = await request(app).get('/api/v1/transactions');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 20,
    });
  });

  it('filtra por tipo', async () => {
    const res = await request(app).get('/api/v1/transactions?type=EXPENSE');
    expect(res.status).toBe(200);
    res.body.data.forEach((tx: any) => {
      expect(tx.type).toBe('EXPENSE');
    });
  });
});

describe('GET /api/v1/transactions/:id', () => {
  let txId: string;

  beforeAll(async () => {
    const categoryId = (global as any).testCategoryId;
    const res = await request(app).post('/api/v1/transactions').send({
      amount: 10000,
      date: '2024-01-01T00:00:00.000Z',
      categoryId,
    });
    txId = res.body.data.id;
  });

  it('retorna la transacción por ID', async () => {
    const res = await request(app).get(`/api/v1/transactions/${txId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(txId);
  });

  it('retorna 404 para ID inexistente', async () => {
    const res = await request(app).get('/api/v1/transactions/claaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/transactions/:id', () => {
  let txId: string;

  beforeAll(async () => {
    const categoryId = (global as any).testCategoryId;
    const res = await request(app).post('/api/v1/transactions').send({
      amount: 5000,
      date: '2024-02-01T00:00:00.000Z',
      categoryId,
    });
    txId = res.body.data.id;
  });

  it('actualiza el monto de una transacción', async () => {
    const res = await request(app)
      .patch(`/api/v1/transactions/${txId}`)
      .send({ amount: 9999, description: 'Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Actualizado');
  });
});

describe('DELETE /api/v1/transactions/:id', () => {
  it('elimina una transacción existente', async () => {
    const categoryId = (global as any).testCategoryId;
    const created = await request(app).post('/api/v1/transactions').send({
      amount: 1000,
      date: '2024-06-01T00:00:00.000Z',
      categoryId,
    });

    const txId = created.body.data.id;
    const res = await request(app).delete(`/api/v1/transactions/${txId}`);

    expect(res.status).toBe(204);
  });
});
