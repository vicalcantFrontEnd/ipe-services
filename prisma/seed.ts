import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  // Create default admin user
  await prisma.user.upsert({
    where: { email: 'admin@ipe.edu.pe' },
    update: {},
    create: {
      email: 'admin@ipe.edu.pe',
      firstName: 'Admin',
      lastName: 'IPE',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
