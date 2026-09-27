import { prisma } from '../src/lib/prisma';
import { afterAll, beforeAll } from 'vitest';

// Usa una BD de test en memoria o un archivo separado
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';

// Semilla mínima de categorías para los tests
let testCategoryId: string;

beforeAll(async () => {
  await prisma.$connect();

  // Limpiar y re-crear datos de test
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();

  const category = await prisma.category.create({
    data: { name: 'Test-Alimentación', icon: '🍔', color: '#FF6B6B' },
  });

  testCategoryId = category.id;

  // Exportar para uso en tests
  (global as any).testCategoryId = testCategoryId;
});

afterAll(async () => {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.$disconnect();
});
