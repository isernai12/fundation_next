import { prisma } from "./src/lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    where: { role: { name: "Employee" } },
    include: { role: true }
  });

  if (!user) {
    console.log("No Employee user found");
    return;
  }

  console.log(`Testing for user: ${user.username} (ID: ${user.id}, Role: ${user.role.name})`);

  const userWithPerms = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: {
        select: {
          id: true,
          name: true,
          permissions: {
            select: {
              permission: {
                select: { module: true, action: true }
              }
            }
          }
        }
      },
      userPermissions: {
        select: {
          permission: {
            select: { module: true, action: true }
          }
        }
      }
    }
  });

  const permissions = new Set<string>();

  userWithPerms?.role?.permissions.forEach((rp) => {
    permissions.add(`${rp.permission.module}:${rp.permission.action}`);
  });

  userWithPerms?.userPermissions.forEach((up) => {
    permissions.add(`${up.permission.module}:${up.permission.action}`);
  });

  console.log(Array.from(permissions));
}

main().catch(console.error);
