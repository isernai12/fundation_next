const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const foundations = await prisma.foundation.findMany()
  console.log("Foundations:", foundations)
}
main().finally(() => prisma.$disconnect())
