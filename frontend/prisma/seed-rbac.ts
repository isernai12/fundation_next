import { prisma } from "../src/lib/prisma"

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
  console.log("Seeding permissions...")
  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
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
  }

  console.log("Seeding roles...")
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
  }

  // Create default Super Admin user if not exists
  const superAdminRole = await prisma.role.findUnique({ where: { name: "Super Admin" } })
  if (superAdminRole) {
    const existingSA = await prisma.user.findFirst({ where: { roleId: superAdminRole.id } })
    if (!existingSA) {
       // Just update first user to Super Admin if any exist
       const firstUser = await prisma.user.findFirst()
       if (firstUser) {
          await prisma.user.update({
            where: { id: firstUser.id },
            data: { roleId: superAdminRole.id }
          })
       }
    }
  }

  console.log("Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
