import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create foundation
  const foundation = await prisma.foundation.create({
    data: {
      name: 'Global Foundation',
      description: 'Main Foundation ERP instance',
    },
  })

  // Create basic groups
  await prisma.group.create({
    data: {
      foundationId: foundation.id,
      name: 'Alpha Group',
      code: 'G-ALPHA',
      description: 'First Division',
    },
  })

  await prisma.group.create({
    data: {
      foundationId: foundation.id,
      name: 'Beta Group',
      code: 'G-BETA',
      description: 'Second Division',
    },
  })

  await prisma.group.create({
    data: {
      foundationId: foundation.id,
      name: 'Gamma Group',
      code: 'G-GAMMA',
      description: 'Third Division',
    },
  })

  // Create foundation general fund
  await prisma.fund.create({
    data: {
      name: 'General Fund',
      description: 'Main foundation unrestricted fund',
    },
  })

  // Basic settings
  await prisma.settings.create({
    data: {
      key: 'SYSTEM_CURRENCY',
      value: 'USD',
      description: 'Default system currency',
    },
  })

  console.log("Seeding initial Super Admin...")

  // Create Super Admin Role
  let role = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" }
  })
  
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "SUPER_ADMIN",
        description: "Super Administrator with full access",
      },
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10)

  // Create Super Admin User
  let user = await prisma.user.findUnique({
    where: { username: "admin" }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "System Administrator",
        username: "admin",
        email: "admin@foundation.local",
        password: hashedPassword,
        roleId: role.id,
        status: "ACTIVE",
      },
    })
  } else {
    await prisma.user.update({
      where: { username: "admin" },
      data: { password: hashedPassword, roleId: role.id, status: "ACTIVE" }
    })
  }

  console.log(`Created/Updated admin user`)

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
