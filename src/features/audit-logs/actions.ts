"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac";

export async function getAuditLogs() {
    await requirePermission("Settings", "View");
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
