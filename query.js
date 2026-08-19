import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    const res = await prisma.institution.findMany();
    console.log(JSON.stringify(res, null, 2));
}

run().finally(() => prisma.$disconnect());
