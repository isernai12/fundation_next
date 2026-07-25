const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const sessions = await prisma.userSession.findMany()
  console.log("Sessions:", sessions)
}
main().finally(() => prisma.$disconnect())
