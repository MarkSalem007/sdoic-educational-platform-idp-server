import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const q = await prisma.question.findUnique({
        where: { code: 'Q-AP02-0002' },
        include: { questionOptions: true }
    });
    console.log(JSON.stringify(q, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
