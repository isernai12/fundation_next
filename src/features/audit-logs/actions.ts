"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission, checkPermission } from "@/lib/rbac";

export async function getAuditLogs() {
  if (!await checkPermission("Settings", "View")) return [];
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 500 // Limit for initial UI load
  })
}
