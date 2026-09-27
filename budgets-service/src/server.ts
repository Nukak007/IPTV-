import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const app = createApp();

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');

    app.listen(env.PORT, () => {
      console.log(`🚀 budgets-service corriendo en http://localhost:${env.PORT}`);
      console.log(`   Entorno: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servicio:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
