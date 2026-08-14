import { prisma } from "./prisma"
import { getAuthSession } from "./auth"
import { hasPermission, isSuperAdminRole } from "./rbac-client"
import { cache } from "react"
import { redirect } from "next/navigation"

/**
 * Fetch all permissions for a user (from their Role + Custom UserPermissions)
 */
export const getUserPermissions = cache(async (userId: string) => {
  if (!userId) return []

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
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

  if (!user || !user.role) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RBAC DEBUG] User or Role not found for User ID: ${userId}`)
    }
    return []
  }

  // 1. HARDCODED SUPER_ADMIN BYPASS: Always return wildcard "*"
  if (isSuperAdminRole(user.role.name)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RBAC DEBUG] Current User: ${user.name} (${user.username}) | Current Role: ${user.role.name} | Loaded Permissions: ["*"] (SUPER_ADMIN Wildcard)`)
    }
    return ["*"]
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

  const permissionsArray = Array.from(permissions)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[RBAC DEBUG] Current User: ${user.name} (${user.username}) | Current Role: ${user.role.name} | Loaded Permissions Count: ${permissionsArray.length}`)
  }

  return permissionsArray
})

/**
 * Fetch user preferences (cached per request to avoid duplicate queries)
 */
export const getUserPreferences = cache(async (userId: string) => {
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true }
  })

  if (!user?.preferences) return null

  try {
    return JSON.parse(user.preferences) as { dateFormat?: string; timezone?: string }
  } catch {
    return null
  }
})

export { hasPermission, isSuperAdminRole }

/**
 * Helper to log and redirect on unauthorized access
 */
async function handleUnauthorized(userId: string, module: string, action: string) {
  try {
    const { headers } = await import("next/headers")
    const h = await headers()
    const ipAddress = h.get("x-forwarded-for") || h.get("x-real-ip") || ""
    const userAgent = h.get("user-agent") || ""
    
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "UNAUTHORIZED_ACCESS",
        module: module,
        remarks: `Attempted to ${action} on module ${module} without permission`,
        ipAddress: ipAddress.split(',')[0].trim().substring(0, 45),
        browser: userAgent.substring(0, 255),
      }
    })
  } catch (e) {
    console.error("[RBAC] Failed to log audit:", e)
  }
  
  redirect(`/unauthorized?module=${encodeURIComponent(module)}&action=${encodeURIComponent(action)}`)
}

/**
 * Server-side guard to require authentication and a specific permission.
 * Redirects if unauthorized.
 */
export async function requirePermission(module: string, action: string) {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) {
    redirect("/login")
  }

  const userId = user.id
  const userRole = user.role

  // 1. HARDCODED SUPER_ADMIN BYPASS
  if (isSuperAdminRole(userRole)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RBAC DEBUG] Current User: ${user.name || user.id} | Current Role: ${userRole} | Loaded Permissions: ["*"] | Requested Module: ${module} | Requested Action: ${action} | Result: ALLOWED (SUPER_ADMIN Bypass)`)
    }
    return user
  }

  const permissions = await getUserPermissions(userId)
  const isAllowed = hasPermission(permissions, module, action, userRole)

  if (process.env.NODE_ENV === 'development') {
    console.log(`[RBAC DEBUG] Current User: ${user.name || user.id} | Current Role: ${userRole} | Loaded Permissions: ${permissions.length} items | Requested Module: ${module} | Requested Action: ${action} | Result: ${isAllowed ? "ALLOWED" : "DENIED"}`)
  }

  if (!isAllowed) {
    await handleUnauthorized(userId, module, action)
  }

  return user
}

/**
 * Page-level guard to redirect to 403 if unauthorized.
 */
export async function authorizePage(module: string, action: string) {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) {
    redirect("/login")
  }

  const userId = user.id
  const userRole = user.role

  // 1. HARDCODED SUPER_ADMIN BYPASS
  if (isSuperAdminRole(userRole)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RBAC DEBUG] Authorize Page - Current User: ${user.name || user.id} | Current Role: ${userRole} | Loaded Permissions: ["*"] | Requested Module: ${module} | Requested Action: ${action} | Result: ALLOWED (SUPER_ADMIN Bypass)`)
    }
    return { session, permissions: ["*"] }
  }

  const permissions = await getUserPermissions(userId)
  const isAllowed = hasPermission(permissions, module, action, userRole)

  if (process.env.NODE_ENV === 'development') {
    console.log(`[RBAC DEBUG] Authorize Page - Current User: ${user.name || user.id} | Current Role: ${userRole} | Loaded Permissions: ${permissions.length} items | Requested Module: ${module} | Requested Action: ${action} | Result: ${isAllowed ? "ALLOWED" : "DENIED"}`)
  }

  if (!isAllowed) {
    await handleUnauthorized(userId, module, action)
  }

  return { session, permissions }
}

/**
 * Non-redirecting server-side permission checker for safe data loading.
 */
export async function checkPermission(module: string, action: string): Promise<boolean> {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) return false

  const userRole = user.role

  // 1. HARDCODED SUPER_ADMIN BYPASS
  if (isSuperAdminRole(userRole)) {
    return true
  }

  const permissions = await getUserPermissions(user.id)
  return hasPermission(permissions, module, action, userRole)
}
