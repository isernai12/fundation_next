import { prisma } from '../src/lib/prisma'

async function main() {
  const groups = await prisma.group.findMany()
  console.log("Groups:", groups)
}
main().finally(() => prisma.$disconnect())
