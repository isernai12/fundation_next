import { prisma } from './src/lib/prisma';

async function sync() {
  console.log("Syncing permissions...");
  
  const requiredPermissions = [
    { module: 'Dashboard', action: 'View' },
    { module: 'Members', action: 'View' },
    { module: 'Members', action: 'Add' },
    { module: 'Members', action: 'Edit' },
    { module: 'Members', action: 'Delete' },
    { module: 'Beneficiaries', action: 'View' },
    { module: 'Beneficiaries', action: 'Add' },
    { module: 'Beneficiaries', action: 'Edit' },
    { module: 'Beneficiaries', action: 'Delete' },
    { module: 'Donors', action: 'View' },
    { module: 'Donors', action: 'Add' },
    { module: 'Donors', action: 'Edit' },
    { module: 'Donors', action: 'Delete' },
    { module: 'Donors', action: 'Receive Installment' },
    { module: 'Fund Collection', action: 'View' },
    { module: 'Fund Collection', action: 'Add' },
    { module: 'Fund Collection', action: 'Edit' },
    { module: 'Fund Collection', action: 'Delete' },
    { module: 'Loans', action: 'View' },
    { module: 'Loans', action: 'Add' },
    { module: 'Loans', action: 'Edit' },
    { module: 'Loans', action: 'Manage' },
    { module: 'Loans', action: 'Delete' },
    { module: 'Grants', action: 'View' },
    { module: 'Grants', action: 'Add' },
    { module: 'Grants', action: 'Edit' },
    { module: 'Grants', action: 'Manage' },
    { module: 'Grants', action: 'Delete' },
    { module: 'Groups', action: 'View' },
    { module: 'Groups', action: 'Add' },
    { module: 'Groups', action: 'Edit' },
    { module: 'Groups', action: 'Manage' },
    { module: 'Groups', action: 'Delete' },
    { module: 'Reports', action: 'View' },
    { module: 'Settings', action: 'View' },
    { module: 'Settings', action: 'Add' },
    { module: 'Settings', action: 'Edit' },
    { module: 'Settings', action: 'Manage' },
    { module: 'Settings', action: 'Delete' },
    { module: 'Users', action: 'View' },
    { module: 'Users', action: 'Add' },
    { module: 'Users', action: 'Edit' },
    { module: 'Users', action: 'Delete' },
    { module: 'Roles & Permissions', action: 'View' },
    { module: 'Roles & Permissions', action: 'Manage' },
  ];

  // 1. Create all missing required permissions
  for (const rp of requiredPermissions) {
    const existing = await prisma.permission.findFirst({
      where: { module: rp.module, action: rp.action }
    });
    if (!existing) {
      console.log(`Creating missing standard permission: ${rp.module}:${rp.action}`);
      await prisma.permission.create({
        data: { module: rp.module, action: rp.action }
      });
    }
  }

  // 2. Define mappings from OLD to NEW
  const mappings = [
    { oldMod: 'Dashboard', oldAct: 'View Dashboard', newMod: 'Dashboard', newAct: 'View' },
    { oldMod: 'Dashboard', oldAct: 'View Financial Cards', newMod: 'Dashboard', newAct: 'View' },
    { oldMod: 'Dashboard', oldAct: 'View Loan Summary', newMod: 'Dashboard', newAct: 'View' },
    { oldMod: 'Dashboard', oldAct: 'View Donation Summary', newMod: 'Dashboard', newAct: 'View' },
    { oldMod: 'Dashboard', oldAct: 'View Charts', newMod: 'Dashboard', newAct: 'View' },
    { oldMod: 'Dashboard', oldAct: 'View Reports', newMod: 'Reports', newAct: 'View' },
    { oldMod: 'Loans', oldAct: 'Create', newMod: 'Loans', newAct: 'Add' },
    { oldMod: 'Loans', oldAct: 'Approve', newMod: 'Loans', newAct: 'Manage' },
    { oldMod: 'Loans', oldAct: 'Receive Installment', newMod: 'Loans', newAct: 'Manage' }, // mapped to Manage, except Donors is explicit
    { oldMod: 'Grants', oldAct: 'Create', newMod: 'Grants', newAct: 'Add' },
    { oldMod: 'Grants', oldAct: 'Approve', newMod: 'Grants', newAct: 'Manage' },
    { oldMod: 'Groups', oldAct: 'Create', newMod: 'Groups', newAct: 'Add' },
    { oldMod: 'Users', oldAct: 'Create', newMod: 'Users', newAct: 'Add' },
    { oldMod: 'Financial Support', oldAct: 'View', newMod: 'Fund Collection', newAct: 'View' },
    { oldMod: 'Financial Support', oldAct: 'Add', newMod: 'Fund Collection', newAct: 'Add' },
    { oldMod: 'Financial Support', oldAct: 'Edit', newMod: 'Fund Collection', newAct: 'Edit' },
    { oldMod: 'Financial Support', oldAct: 'Delete', newMod: 'Fund Collection', newAct: 'Delete' },
  ];

  // 3. Execute mappings
  for (const map of mappings) {
    const oldPerm = await prisma.permission.findFirst({ where: { module: map.oldMod, action: map.oldAct } });
    if (oldPerm) {
      const newPerm = await prisma.permission.findFirst({ where: { module: map.newMod, action: map.newAct } });
      if (newPerm && oldPerm.id !== newPerm.id) {
        console.log(`Mapping ${map.oldMod}:${map.oldAct} -> ${map.newMod}:${map.newAct}`);
        // Re-assign role permissions
        const rolePerms = await prisma.rolePermission.findMany({ where: { permissionId: oldPerm.id } });
        for (const rp of rolePerms) {
          try {
            await prisma.rolePermission.create({ data: { roleId: rp.roleId, permissionId: newPerm.id } });
          } catch(e) {} // ignore unique constraint
        }
        // Re-assign user permissions
        const userPerms = await prisma.userPermission.findMany({ where: { permissionId: oldPerm.id } });
        for (const up of userPerms) {
          try {
            await prisma.userPermission.create({ data: { userId: up.userId, permissionId: newPerm.id } });
          } catch(e) {}
        }
        // Delete old
        await prisma.rolePermission.deleteMany({ where: { permissionId: oldPerm.id } });
        await prisma.userPermission.deleteMany({ where: { permissionId: oldPerm.id } });
        await prisma.permission.delete({ where: { id: oldPerm.id } });
      }
    }
  }

  // 4. Delete ANY permission that is NOT in the required list
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    const isRequired = requiredPermissions.find(rp => rp.module === perm.module && rp.action === perm.action);
    if (!isRequired) {
      console.log(`Deleting unknown permission: ${perm.module}:${perm.action}`);
      await prisma.rolePermission.deleteMany({ where: { permissionId: perm.id } });
      await prisma.userPermission.deleteMany({ where: { permissionId: perm.id } });
      await prisma.permission.delete({ where: { id: perm.id } });
    }
  }

  console.log("Done syncing.");
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
