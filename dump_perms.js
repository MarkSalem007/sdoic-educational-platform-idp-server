import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  const perms = await prisma.permission.findMany({
    include: { module: { include: { application: true } } }
  });
  console.log(JSON.stringify(perms, null, 2)); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
