import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const permissions = await prisma.permission.findMany()
  console.log("Permissions:", permissions.slice(0, 10))
  
  const modules = await prisma.permission.findMany({ select: { module: true }, distinct: ['module']})
  console.log("Modules:", modules)
  
  const actions = await prisma.permission.findMany({ select: { action: true }, distinct: ['action']})
  console.log("Actions:", actions)
}

main()
