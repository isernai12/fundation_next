import { prisma } from "./prisma"
import { getAuthSession } from "./auth"
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

  if (!user) return []

  // If Super Admin, they inherently have all permissions (or we can just return a wildcard)
  if (user.role.name === "Super Admin" || user.role.name === "SUPER_ADMIN") {
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

  return Array.from(permissions)
})

/**
 * Helper to check if a specific permission string exists in the array
 */
export function hasPermission(
  userPermissions: string[],
  module: string,
  action: string
): boolean {
  if (userPermissions.includes("*")) return true
  return userPermissions.includes(`${module}:${action}`)
}

/**
 * Server-side guard to require authentication and a specific permission.
 * Throws an error or redirects if unauthorized.
 */
export async function requirePermission(module: string, action: string) {
  const session = await getAuthSession()
  if (!(session?.user as any)?.id) {
    throw new Error("Unauthorized: Please log in.")
  }

  const permissions = await getUserPermissions((session!.user as any).id)
  
  if (!hasPermission(permissions, module, action)) {
    throw new Error(`Forbidden: You do not have permission to ${action} in ${module}.`)
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

  const permissions = await getUserPermissions((session!.user as any).id)
  
  if (!hasPermission(permissions, module, action)) {
    redirect("/?error=forbidden")
  }

  return { session, permissions }
}
