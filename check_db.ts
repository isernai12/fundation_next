import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const roles = await prisma.role.findMany()
  console.log("Roles:", roles)
  const permissions = await prisma.permission.findMany()
  console.log("Permissions:", permissions.length)
}

main()
