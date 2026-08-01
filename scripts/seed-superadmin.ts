import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import * as bcrypt from 'bcryptjs'

const defaultPermissions = [
  // Dashboard
  { module: "Dashboard", action: "View Dashboard" },
  { module: "Dashboard", action: "View Financial Cards" },
  { module: "Dashboard", action: "View Loan Summary" },
  { module: "Dashboard", action: "View Donation Summary" },
  { module: "Dashboard", action: "View Reports" },
  { module: "Dashboard", action: "View Charts" },

  // Members
  { module: "Members", action: "View" },
  { module: "Members", action: "Add" },
  { module: "Members", action: "Edit" },
  { module: "Members", action: "Delete" },

  // Beneficiaries
  { module: "Beneficiaries", action: "View" },
  { module: "Beneficiaries", action: "Add" },
  { module: "Beneficiaries", action: "Edit" },
  { module: "Beneficiaries", action: "Delete" },

  // Donors
  { module: "Donors", action: "View" },
  { module: "Donors", action: "Add" },
  { module: "Donors", action: "Edit" },
  { module: "Donors", action: "Delete" },

  // Fund Collection
  { module: "Fund Collection", action: "View" },
  { module: "Fund Collection", action: "Add" },
  { module: "Fund Collection", action: "Edit" },
  { module: "Fund Collection", action: "Delete" },

  // Financial Support
  { module: "Financial Support", action: "View" },
  { module: "Financial Support", action: "Add" },
  { module: "Financial Support", action: "Edit" },
  { module: "Financial Support", action: "Delete" },

  // Loans
  { module: "Loans", action: "View" },
  { module: "Loans", action: "Create" },
  { module: "Loans", action: "Edit" },
  { module: "Loans", action: "Delete" },
  { module: "Loans", action: "Approve" },
  { module: "Loans", action: "Receive Installment" },

  // Grants
  { module: "Grants", action: "View" },
  { module: "Grants", action: "Create" },
  { module: "Grants", action: "Edit" },
  { module: "Grants", action: "Delete" },
  { module: "Grants", action: "Approve" },

  // Groups
  { module: "Groups", action: "View" },
  { module: "Groups", action: "Create" },
  { module: "Groups", action: "Edit" },
  { module: "Groups", action: "Delete" },

  // Reports
  { module: "Reports", action: "View" },

  // Settings
  { module: "Settings", action: "View" },
  { module: "Settings", action: "Edit" },

  // Users
  { module: "Users", action: "View" },
  { module: "Users", action: "Create" },
  { module: "Users", action: "Edit" },
  { module: "Users", action: "Delete" },

  // Roles & Permissions
  { module: "Roles & Permissions", action: "View" },
  { module: "Roles & Permissions", action: "Manage" },
]

const roles = [
  "Super Admin",
  "Admin",
  "Manager",
  "Cashier",
  "Employee",
]

async function main() {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  
  const prisma = new PrismaClient({ adapter })

  console.log('Connected to Turso via PrismaLibSQL')

  console.log("Seeding permissions...")
  const createdPermissions = []
  for (const perm of defaultPermissions) {
    const p = await prisma.permission.upsert({
      where: {
        module_action: {
          module: perm.module,
          action: perm.action,
        },
      },
      update: {},
      create: {
        module: perm.module,
        action: perm.action,
      },
    })
    createdPermissions.push(p)
  }

  console.log("Seeding roles...")
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
  }

  // Get Super Admin role
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Super Admin" } })

  console.log("Mapping all permissions to Super Admin role...")
  for (const p of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
      }
    })
  }

  console.log("Creating super admin user...")
  const hashedPassword = await bcrypt.hash("admin123", 10)
  
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: hashedPassword,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
    create: {
      name: "Super Admin",
      username: "admin",
      password: hashedPassword,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    }
  })

  console.log(`Created admin user with username: ${adminUser.username} and role: Super Admin`)
  
  await prisma.$disconnect()
  console.log("Seed complete!")
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
