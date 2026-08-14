import { prisma } from '../src/lib/prisma'

async function main() {
  await prisma.group.deleteMany({ where: { code: 'TG001' } })
  console.log("Test group deleted.")
}
main().finally(() => prisma.$disconnect())
