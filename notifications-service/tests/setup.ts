import { prisma } from '../src/lib/prisma';
import { afterAll, beforeAll } from 'vitest';

// Base de datos SQLite para tests
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await prisma.$connect();
  await prisma.notification.deleteMany();
});

afterAll(async () => {
  await prisma.notification.deleteMany();
  await prisma.$disconnect();
});
