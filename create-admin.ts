import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const role = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator',
    },
  })

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
      roleId: role.id,
    },
    create: {
      name: 'Admin User',
      username: 'admin',
      password: hashedPassword,
      roleId: role.id,
      status: 'ACTIVE',
    },
  })

  console.log('Admin user created/updated successfully.')
  console.log('Username: admin')
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
