import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const SUPER_ADMIN = {
  email: 'admin@ipe.edu.pe',
  password: 'Admin2025!',
  firstName: 'Admin',
  lastName: 'IPE',
};

async function main(): Promise<void> {
  console.log('Seeding database...');

  const passwordHash = await argon2.hash(SUPER_ADMIN.password);

  const user = await prisma.user.upsert({
    where: { email: SUPER_ADMIN.email },
    update: {},
    create: {
      email: SUPER_ADMIN.email,
      passwordHash,
      firstName: SUPER_ADMIN.firstName,
      lastName: SUPER_ADMIN.lastName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`SUPER_ADMIN created: ${user.email} (${user.id})`);
  console.log(`Password: ${SUPER_ADMIN.password}`);
  console.log('\n⚠ Cambia esta contraseña después del primer login');
  console.log('Seed completed successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
