const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { profile: true } });
  console.log('USERS:', JSON.stringify(users, null, 2));

  const roles = await prisma.role.findMany();
  console.log('ROLES:', JSON.stringify(roles, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
