const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  await prisma.group.deleteMany({ where: { code: 'TG001' } })
  console.log("Test group deleted.")
}
main().finally(() => prisma.$disconnect())
