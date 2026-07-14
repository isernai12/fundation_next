"use server"

import { prisma } from "@/lib/prisma"

export async function getAuditLogs() {
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
