const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const roles = await prisma.role.findMany();
    console.log(roles.map(r => r.code));
}
main().catch(console.error).finally(() => prisma.$disconnect());
