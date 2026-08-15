"use server";

import { requirePermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { reportsApi, fundsApi, membersApi } from "@/lib/api";

export async function getFoundationSummary() {
  await requirePermission("Reports", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const stats = await reportsApi.getDashboardStats(token);
    return (stats.groupFundDistribution || []).map((g, idx) => ({
      id: String(idx),
      fundName: g.name,
      groupName: g.name,
      type: "Equity",
      balance: g.value,
    }));
  } catch (error) {
    console.error("[Reports] Failed to fetch foundation summary:", error);
    return [];
  }
}

export async function getGeneralLedgerReport() {
  await requirePermission("Reports", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const res = await fundsApi.list({ page_size: 1000 }, token);
    return (res.items || []).map((f) => ({
      id: f.id,
      date: f.created_at,
      type: "GENERAL",
      referenceId: f.name,
      fund: f.name,
      group: f.group_name || "Foundation",
      debit: f.current_balance >= 0 ? f.current_balance : 0,
      credit: f.current_balance < 0 ? Math.abs(f.current_balance) : 0,
      notes: f.description || "",
    }));
  } catch (error) {
    console.error("[Reports] Failed to fetch general ledger report:", error);
    return [];
  }
}

export async function getMemberDirectoryReport() {
  await requirePermission("Reports", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const res = await membersApi.list({ page_size: 1000 }, token);
    return res.items.map((m) => ({
      memberId: m.member_id,
      name: `${m.full_name || "নাম পাওয়া যায়নি"}`,
      mobile: m.mobile || "-",
      bloodGroup: m.blood_group || "-",
      nid: m.national_id || "-",
      presentAddress: m.present_address || "-",
      status: m.status,
      group: m.group_name || "General",
    }));
  } catch (error) {
    console.error("[Reports] Failed to fetch member directory report:", error);
    return [];
  }
}
