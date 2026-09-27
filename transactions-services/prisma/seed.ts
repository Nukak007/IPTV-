import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Comida', icon: '🍲', color: '#FF7F50' },
  { name: 'Alimentación', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transporte', icon: '🚌', color: '#4ECDC4' },
  { name: 'Servicios', icon: '💡', color: '#45B7D1' },
  { name: 'Salud', icon: '🏥', color: '#96CEB4' },
  { name: 'Entretenimiento', icon: '🎬', color: '#FFEAA7' },
  { name: 'Ropa y Calzado', icon: '👗', color: '#DDA0DD' },
  { name: 'Educación', icon: '📚', color: '#98D8C8' },
  { name: 'Ahorro', icon: '🐷', color: '#F7DC6F' },
  { name: 'Trabajo / Ingresos', icon: '💼', color: '#85C1E9' },
  { name: 'Otros', icon: '📦', color: '#BDC3C7' },
];

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed de categorías...');

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`  ✅ ${category.icon} ${category.name}`);
  }

  console.log('\n✨ Seed completado. Categorías disponibles:', CATEGORIES.length);
}

main()
  .catch((error) => {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
