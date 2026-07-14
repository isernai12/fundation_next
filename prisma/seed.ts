import { PrismaClient } from '@prisma/client'

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
