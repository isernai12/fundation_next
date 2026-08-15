import { prisma } from '../src/lib/prisma'

async function main() {
  const sessions = await prisma.userSession.findMany()
  console.log("Sessions:", sessions)
}
main().finally(() => prisma.$disconnect())
