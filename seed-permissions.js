import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Applications, Modules, and Permissions...');

  // 1. Create or Find Application (Test Item Bank)
  const itemBankApp = await prisma.application.upsert({
    where: { code: 'TEST_ITEM_BANK' },
    update: {},
    create: {
      name: 'Test Item Bank',
      code: 'TEST_ITEM_BANK',
      baseUrl: 'http://localhost:3002',
      type: 'INTERNAL',
    },
  });

  // 2. Create or Find Application (Portal Gateway)
  const portalApp = await prisma.application.upsert({
    where: { code: 'PORTAL_GATEWAY' },
    update: {},
    create: {
      name: 'Portal Gateway',
      code: 'PORTAL_GATEWAY',
      baseUrl: 'http://localhost:3001',
      type: 'INTERNAL',
    },
  });

  // 3. Create Modules
  const questionsModule = await prisma.applicationModule.upsert({
    where: { applicationId_code: { applicationId: itemBankApp.id, code: 'QUESTIONS' } },
    update: {},
    create: {
      applicationId: itemBankApp.id,
      name: 'Questions Management',
      code: 'QUESTIONS',
      description: 'Manage test questions and answers'
    },
  });

  const examsModule = await prisma.applicationModule.upsert({
    where: { applicationId_code: { applicationId: itemBankApp.id, code: 'EXAMS' } },
    update: {},
    create: {
      applicationId: itemBankApp.id,
      name: 'Exams Management',
      code: 'EXAMS',
      description: 'Manage exams and publishing'
    },
  });

  // 4. Create Permissions
  const permissionsToCreate = [
    { moduleId: questionsModule.id, name: 'Create Question', code: 'CREATE_QUESTION', description: 'Can create new test questions' },
    { moduleId: questionsModule.id, name: 'View Question', code: 'VIEW_QUESTION', description: 'Can view test questions' },
    { moduleId: questionsModule.id, name: 'Edit Question', code: 'EDIT_QUESTION', description: 'Can edit test questions' },
    { moduleId: questionsModule.id, name: 'Delete Question', code: 'DELETE_QUESTION', description: 'Can delete test questions' },
    { moduleId: examsModule.id, name: 'Create Exam', code: 'CREATE_EXAM', description: 'Can create exams' },
    { moduleId: examsModule.id, name: 'Publish Exam', code: 'PUBLISH_EXAM', description: 'Can publish exams to the portal' },
  ];

  for (const p of permissionsToCreate) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log('Successfully seeded permissions!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
