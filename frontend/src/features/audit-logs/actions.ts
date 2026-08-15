"use server";

import { checkPermission } from "@/lib/rbac";
import { apiClient } from "@/lib/api/client";
import { getAuthSession } from "@/lib/auth";

export async function getAuditLogs() {
  if (!(await checkPermission("Settings", "View"))) return [];
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    const logs = await apiClient.get<any[]>("/api/v1/audit-logs", {
      params: { limit: 500 },
      token,
    });
    return logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      module: log.module,
      resourceId: log.resourceId,
      oldData: log.oldData,
      newData: log.newData,
      ipAddress: log.ipAddress,
      device: log.device,
      browser: log.browser,
      remarks: log.remarks,
      createdAt: new Date(log.createdAt),
      user: log.user ? { name: log.user.name, username: log.user.username } : null,
    }));
  } catch (error) {
    console.error("[AuditLogs] Failed to fetch audit logs:", error);
    return [];
  }
}
