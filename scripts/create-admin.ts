const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for admin role...');
  let adminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' }
  });

  if (!adminRole) {
    console.log('Role not found. Creating SUPER_ADMIN role...');
    adminRole = await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full access'
      }
    });
  }

  console.log('Checking for admin user...');
  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!existingUser) {
    console.log('User not found. Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@foundation.local',
        password: hashedPassword,
        roleId: adminRole.id,
        status: 'ACTIVE'
      }
    });
    console.log('Created user:', user.username);
  } else {
    console.log('User already exists. Updating password to admin123...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { username: 'admin' },
      data: { 
        password: hashedPassword,
        status: 'ACTIVE',
        roleId: adminRole.id
      }
    });
    console.log('Updated user password and status.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
