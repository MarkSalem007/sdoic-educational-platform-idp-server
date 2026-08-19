const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Check if System Admin role exists, or create it
  let adminRole = await prisma.role.findUnique({ where: { code: 'SYS_ADMIN' } });
  
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'System Administrator',
        code: 'SYS_ADMIN',
        description: 'Superuser with full access to all applications and modules.',
      }
    });
    console.log('Created new role: System Administrator (SYS_ADMIN)');
  } else {
    console.log('Role SYS_ADMIN already exists.');
  }

  // 2. Find your main account
  const targetEmail = 'markjoseph.salem-ic@deped.gov.ph';
  const user = await prisma.user.findUnique({ where: { email: targetEmail } });

  if (!user) {
    console.error(`User with email ${targetEmail} not found!`);
    return;
  }

  // 3. Assign the role to the user
  const existingAssignment = await prisma.roleAssignment.findUnique({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id
      }
    }
  });

  if (!existingAssignment) {
    await prisma.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
        assignedBy: 'system-seed'
      }
    });
    console.log(`Successfully assigned SYS_ADMIN role to ${targetEmail}`);
  } else {
    console.log(`User ${targetEmail} is already assigned the SYS_ADMIN role.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
