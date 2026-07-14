import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding initial Super Admin...")

  // Create Super Admin Role
  const role = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Super Administrator with full access",
    },
  })

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create Super Admin User
  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "System Administrator",
      username: "admin",
      email: "admin@foundation.local",
      password: hashedPassword,
      roleId: role.id,
      status: "ACTIVE",
    },
  })

  console.log(`Created user: ${user.username} / password123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
