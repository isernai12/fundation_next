import { prisma } from "./prisma"
import { getAuthSession } from "./auth"
import { hasPermission } from "./rbac-client"
import { cache } from "react"
import { redirect } from "next/navigation"

/**
 * Fetch all permissions for a user (from their Role + Custom UserPermissions)
 */
export const getUserPermissions = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  })

  console.log(`[RBAC DEBUG] Fetching permissions for User ID: ${userId}`);

  if (!user) {
    console.log(`[RBAC DEBUG] User not found in DB!`);
    return []
  }

  console.log(`[RBAC DEBUG] User Role ID: ${user.role?.id}, Name: ${user.role?.name}`);

  // If Super Admin, they inherently have all permissions (or we can just return a wildcard)
  if (user.role.name === "Super Admin" || user.role.name === "SUPER_ADMIN") {
    console.log(`[RBAC DEBUG] Super Admin detected. Returning wildcard.`);
    return ["*"] // Wildcard meaning everything is permitted
  }

  const permissions = new Set<string>()

  // Add role permissions
  user.role.permissions.forEach((rp) => {
    permissions.add(`${rp.permission.module}:${rp.permission.action}`)
  })

  // Add custom user permissions
  user.userPermissions.forEach((up) => {
    permissions.add(`${up.permission.module}:${up.permission.action}`)
  })

  const permissionsArray = Array.from(permissions);
  console.log(`[RBAC DEBUG] Final permissions array length: ${permissionsArray.length}`);
  console.log(`[RBAC DEBUG] Permissions: `, permissionsArray);
  
  return permissionsArray
})

export { hasPermission }

/**
 * Helper to log and redirect on unauthorized access
 */
async function handleUnauthorized(userId: string, module: string, action: string) {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const ipAddress = h.get("x-forwarded-for") || h.get("x-real-ip") || "";
    const userAgent = h.get("user-agent") || "";
    
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "UNAUTHORIZED_ACCESS",
        module: module,
        remarks: `Attempted to ${action} without permission`,
        ipAddress: ipAddress.split(',')[0].trim().substring(0, 45),
        browser: userAgent.substring(0, 255),
      }
    });
  } catch (e) {
    console.error("[RBAC] Failed to log audit:", e);
  }
  
  redirect(`/unauthorized?module=${encodeURIComponent(module)}&action=${encodeURIComponent(action)}`);
}

/**
 * Server-side guard to require authentication and a specific permission.
 * Redirects if unauthorized.
 */
export async function requirePermission(module: string, action: string) {
  const session = await getAuthSession()
  if (!(session?.user as any)?.id) {
    redirect("/login")
  }

  const userId = (session!.user as any).id
  const permissions = await getUserPermissions(userId)
  
  const hasPerm = hasPermission(permissions, module, action)
  console.log(`[RBAC DEBUG] requirePermission check - User: ${userId}, Target: ${module}:${action}, Granted: ${hasPerm}`);
  
  if (!hasPerm) {
    console.log(`[RBAC DEBUG] Permission DENIED! User has ${permissions.length} permissions. First few: ${permissions.slice(0, 5).join(", ")}`);
    await handleUnauthorized(userId, module, action)
  }

  return session!.user
}

/**
 * Page-level guard to redirect to 403 if unauthorized.
 */
export async function authorizePage(module: string, action: string) {
  const session = await getAuthSession()
  if (!(session?.user as any)?.id) {
    redirect("/login")
  }

  const userId = (session!.user as any).id
  const permissions = await getUserPermissions(userId)
  
  if (!hasPermission(permissions, module, action)) {
    await handleUnauthorized(userId, module, action)
  }

  return { session, permissions }
}

/**
 * Non-redirecting server-side permission checker for safe data loading.
 */
export async function checkPermission(module: string, action: string): Promise<boolean> {
  const session = await getAuthSession()
  if (!(session?.user as any)?.id) return false
  const userId = (session!.user as any).id
  const permissions = await getUserPermissions(userId)
  return hasPermission(permissions, module, action)
}
