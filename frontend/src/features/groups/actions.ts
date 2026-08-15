"use server";

import { groupSchema, type GroupFormValues } from "./schema";
import type { GroupWithCount } from "./types";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { groupsApi, membersApi, fundsApi } from "@/lib/api";

export async function ensureFoundationGroup() {
  return null;
}

export async function getGroups(): Promise<GroupWithCount[]> {
  if (!(await checkPermission("Groups", "View"))) return [];

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await groupsApi.list({ page_size: 1000 }, token);

    return res.items.map((g) => ({
      id: g.id,
      foundationId: g.foundation_id,
      name: g.name,
      code: g.code,
      shortName: g.short_name || null,
      description: g.description || null,
      remarks: g.remarks || null,
      status: g.status,
      isFoundationGroup: g.is_foundation_group,
      memberSignupEnabled: g.member_signup_enabled,
      createdAt: new Date(g.created_at),
      updatedAt: new Date(g.updated_at),
      createdBy: null,
      updatedBy: null,
      currentFund: Number(g.current_balance || 0),
      _count: {
        members: g.member_count || 0,
      },
    }));
  } catch (error) {
    console.error("[Groups] Failed to fetch groups:", error);
    return [];
  }
}

export async function getMemberSignupGroups() {
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await groupsApi.list({ member_signup_enabled: true, status: "ACTIVE", page_size: 1000 }, token);
    return res.items
      .filter((g) => g.status === "ACTIVE" && g.member_signup_enabled && !g.is_foundation_group)
      .map((g) => ({
        id: g.id,
        name: g.name,
        code: g.code,
        isFoundationGroup: g.is_foundation_group,
        memberSignupEnabled: g.member_signup_enabled,
      }));
  } catch (error) {
    console.error("[Groups] Failed to fetch signup groups:", error);
    return [];
  }
}

export async function getGroup(id: string) {
  if (!(await checkPermission("Groups", "View"))) return null;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const g = await groupsApi.get(id, token);
    const membersRes = await membersApi.list({ group_id: id, page_size: 1000 }, token).catch(() => ({ items: [] }));
    const members = (membersRes.items || []).map((m) => ({
      id: m.id,
      memberId: m.member_id,
      fullName: m.full_name,
      mobile: m.mobile,
      status: m.status,
      position: m.position,
      createdAt: new Date(m.created_at),
    }));

    return {
      id: g.id,
      foundationId: g.foundation_id,
      name: g.name,
      code: g.code,
      shortName: g.short_name || null,
      description: g.description || null,
      remarks: g.remarks || null,
      status: g.status,
      isFoundationGroup: g.is_foundation_group,
      memberSignupEnabled: g.member_signup_enabled,
      createdAt: new Date(g.created_at),
      updatedAt: new Date(g.updated_at),
      createdBy: null,
      updatedBy: null,
      members,
      _count: {
        members: members.length,
      },
    };
  } catch (error) {
    console.error("[Groups] Failed to fetch group:", error);
    return null;
  }
}

export async function createGroup(data: GroupFormValues) {
  await requirePermission("Groups", "Add");
  const parsed = groupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await groupsApi.create(
      {
        name: parsed.data.name.trim(),
        code: parsed.data.code.trim(),
        short_name: parsed.data.shortName?.trim() || null,
        description: parsed.data.description || null,
        remarks: parsed.data.remarks || null,
        status: parsed.data.status,
        is_foundation_group: parsed.data.isFoundationGroup || false,
        member_signup_enabled: parsed.data.isFoundationGroup ? false : parsed.data.memberSignupEnabled,
      },
      token
    );

    revalidatePath("/groups");
    revalidatePath("/groups/manage");
    revalidatePath("/groups", "layout");
    revalidatePath("/members/manage");
    revalidatePath("/donors/receive");
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create group" };
  }
}

export async function updateGroup(id: string, data: GroupFormValues) {
  await requirePermission("Groups", "Edit");
  const parsed = groupSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await groupsApi.update(
      id,
      {
        name: parsed.data.name.trim(),
        code: parsed.data.code.trim(),
        short_name: parsed.data.shortName?.trim() || null,
        description: parsed.data.description || null,
        remarks: parsed.data.remarks || null,
        status: parsed.data.status,
        is_foundation_group: parsed.data.isFoundationGroup,
        member_signup_enabled: parsed.data.isFoundationGroup ? false : parsed.data.memberSignupEnabled,
      },
      token
    );

    revalidatePath("/groups");
    revalidatePath("/groups/manage");
    revalidatePath("/groups", "layout");
    revalidatePath(`/groups/${id}`);
    revalidatePath("/members/manage");
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update group" };
  }
}

export async function archiveGroup(id: string) {
  await requirePermission("Groups", "Manage");
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await groupsApi.update(id, { status: "INACTIVE" }, token);

    revalidatePath("/groups");
    revalidatePath("/groups/manage");
    revalidatePath("/groups", "layout");
    revalidatePath(`/groups/${id}`);
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive group" };
  }
}

export async function deleteGroup(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
  await requirePermission("Groups", "Delete");
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await groupsApi.delete(id, token);

    revalidatePath("/groups");
    revalidatePath("/groups/manage");
    revalidatePath("/groups", "layout");
    revalidatePath(`/groups/${id}`);
    revalidatePath("/members/manage");
    revalidatePath("/donors/receive");
    return { success: true, message: res?.message };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete group" };
  }
}

export async function getGroupMembers(groupId: string) {
  await requirePermission("Groups", "View");
  if (!groupId) return [];
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  const res = await membersApi.list({ group_id: groupId, page_size: 1000 }, token).catch(() => ({ items: [] }));
  return res.items || [];
}

export async function removeMemberFromGroup(memberId: string) {
  await requirePermission("Groups", "Delete");
  return { success: false, error: "Members must belong to a group. Please reassign the member instead of removing them." };
}

export async function getGroupFundSummary(groupId: string) {
  await requirePermission("Groups", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    const fundsRes = await fundsApi.list({ group_id: groupId, page_size: 10 }, token);
    const fund = fundsRes.items[0];
    return {
      groupId,
      groupName: fund?.group_name || "Group",
      currentBalance: fund?.current_balance || 0,
      totalFund: fund?.current_balance || 0,
      totalContributions: 0,
      totalDonations: 0,
      totalLoans: 0,
      totalLoanReturns: 0,
      totalGrants: 0,
      totalExpenses: 0,
      totalIncome: 0,
      memberCount: 0,
      totalTransactions: 0,
    };
  } catch {
    return {
      groupId,
      groupName: "Group",
      currentBalance: 0,
      totalFund: 0,
      totalContributions: 0,
      totalDonations: 0,
      totalLoans: 0,
      totalLoanReturns: 0,
      totalGrants: 0,
      totalExpenses: 0,
      totalIncome: 0,
      memberCount: 0,
      totalTransactions: 0,
    };
  }
}

export async function getGroupLedger(groupId: string) {
  await requirePermission("Groups", "View");
  return [];
}

export async function getGroupTransactions(groupId: string) {
  await requirePermission("Groups", "View");
  return [];
}

export async function getGroupLoans(groupId: string) {
  await requirePermission("Groups", "View");
  return [];
}

export async function getGroupLoanSummary(groupId: string) {
  await requirePermission("Groups", "View");
  return { totalLent: 0, totalOutstanding: 0, activeLoans: 0 };
}
