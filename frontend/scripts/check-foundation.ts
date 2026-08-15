import { prisma } from '../src/lib/prisma'

async function main() {
  const foundations = await prisma.foundation.findMany()
  console.log("Foundations:", foundations)
}
main().finally(() => prisma.$disconnect())
