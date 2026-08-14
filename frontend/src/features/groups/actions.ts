"use server";

import { FinancialService } from "@/services/finance";
import { prisma } from "@/lib/prisma";
import { groupSchema, type GroupFormValues } from "./schema";
import type { GroupWithCount } from "./types";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { groupsApi } from "@/lib/api";

/**
 * Migration Note:
 * This file is migrated to proxy Group/Village data queries and mutations through the FastAPI backend
 * (/api/v1/groups) while maintaining full compatibility with the existing React components.
 */

export async function ensureFoundationGroup() {
  let foundationGroup = await prisma.group.findFirst({
    where: { isFoundationGroup: true },
  });

  if (!foundationGroup) {
    let foundation = await prisma.foundation.findFirst();
    if (!foundation) {
      foundation = await prisma.foundation.create({
        data: {
          name: "Main Foundation",
          description: "Default Foundation (Auto-generated)",
        },
      });
    }

    let code = "FOUNDATION-MAIN";
    const existingCode = await prisma.group.findUnique({ where: { code } });
    if (existingCode) {
      code = `FOUNDATION-${Date.now()}`;
    }

    foundationGroup = await prisma.group.create({
      data: {
        foundationId: foundation.id,
        name: "ভ্রাতৃত্ব ফাউন্ডেশন",
        code,
        shortName: "ফাউন্ডেশন",
        description: "Bhratritya Foundation Main Central Fund",
        status: "ACTIVE",
        isFoundationGroup: true,
        memberSignupEnabled: false,
      },
    });
  }

  return foundationGroup;
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
    await ensureFoundationGroup();

    const groups = await prisma.group.findMany({
      orderBy: [{ isFoundationGroup: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { members: true } },
      },
    });

    if (groups.length === 0) return [];

    const summaries = await FinancialService.getAllGroupSummaries();
    const summaryMap = new Map(summaries.map((s) => [s.groupId, s.currentBalance]));

    return groups.map((group) => ({
      ...group,
      currentFund: Number(summaryMap.get(group.id) || 0),
    }));
  }
}

export async function getMemberSignupGroups() {
  try {
    const res = await groupsApi.list({ member_signup_enabled: true, page_size: 1000 });
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
    await ensureFoundationGroup();

    return prisma.group.findMany({
      where: {
        status: "ACTIVE",
        memberSignupEnabled: true,
        isFoundationGroup: false,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        isFoundationGroup: true,
        memberSignupEnabled: true,
      },
    });
  }
}

export async function getGroup(id: string) {
  if (!(await checkPermission("Groups", "View"))) return null;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const g = await groupsApi.get(id, token);
    const members = await prisma.member.findMany({
      where: { groupId: id },
      orderBy: { createdAt: "desc" },
    });

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
    return prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
        _count: { select: { members: true } },
      },
    });
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
    revalidatePath(`/groups/${id}`);
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
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive group" };
  }
}

export async function deleteGroup(id: string) {
  await requirePermission("Groups", "Delete");
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true, funds: true, documents: true } },
      },
    });

    if (!group) return { success: false, error: "Group not found" };
    if (group.isFoundationGroup) return { success: false, error: "Cannot delete the Foundation Main Group." };
    if (group._count.members > 0) return { success: false, error: "Cannot delete group with existing members." };
    if (group._count.funds > 0) return { success: false, error: "Cannot delete group with existing funds or ledger entries." };

    await prisma.group.delete({ where: { id } });
    revalidatePath("/groups");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete group" };
  }
}

export async function getGroupMembers(groupId: string) {
  await requirePermission("Groups", "View");
  if (!groupId) return [];
  return prisma.member.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
  });
}

export async function removeMemberFromGroup(memberId: string) {
  await requirePermission("Groups", "Delete");
  return { success: false, error: "Members must belong to a group. Please reassign the member instead of removing them." };
}

export async function getGroupFundSummary(groupId: string) {
  await requirePermission("Groups", "View");
  return await FinancialService.getGroupFundSummary(groupId);
}

export async function getGroupLedger(groupId: string) {
  await requirePermission("Groups", "View");
  if (!groupId) return [];

  const groupFund = await prisma.fund.findFirst({
    where: { groupId },
  });

  if (!groupFund) return [];

  const entries = await prisma.ledgerEntry.findMany({
    where: { fundId: groupFund.id },
    include: {
      transaction: true,
    },
    orderBy: { createdAt: "asc" },
  });

  let runningBalance = 0;

  return entries
    .map((entry) => {
      if (entry.isCredit) runningBalance += entry.amount;
      else runningBalance -= entry.amount;

      return {
        id: entry.id,
        date: entry.transaction.date.toISOString().split("T")[0],
        voucher: entry.transaction.id.substring(0, 8).toUpperCase(),
        type: entry.transaction.type,
        reference: entry.transaction.referenceId || "-",
        debit: !entry.isCredit ? entry.amount : 0,
        credit: entry.isCredit ? entry.amount : 0,
        runningBalance,
        remarks: entry.transaction.notes || "-",
      };
    })
    .reverse();
}

export async function getGroupTransactions(groupId: string) {
  await requirePermission("Groups", "View");
  if (!groupId) return [];

  const groupFund = await prisma.fund.findFirst({
    where: { groupId },
  });

  if (!groupFund) return [];

  const entries = await prisma.ledgerEntry.findMany({
    where: { fundId: groupFund.id },
    include: {
      transaction: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return entries.map((entry) => ({
    id: entry.transaction.id,
    date: entry.transaction.date.toISOString().split("T")[0],
    type: entry.transaction.type,
    reference: entry.transaction.referenceId || entry.transaction.id.substring(0, 8).toUpperCase(),
    amount: entry.amount,
    status: entry.transaction.status,
    remarks: entry.transaction.notes || "-",
  }));
}

export async function getGroupLoans(groupId: string) {
  await requirePermission("Groups", "View");
  if (!groupId) return [];

  const fund = await prisma.fund.findFirst({ where: { groupId } });
  if (!fund) return [];

  const allocations = await prisma.fundAllocation.findMany({
    where: { fundId: fund.id, targetType: "LOAN", loanId: { not: null } },
    include: {
      loan: {
        include: { beneficiary: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return allocations;
}

export async function getGroupLoanSummary(groupId: string) {
  await requirePermission("Groups", "View");
  if (!groupId) return { totalLent: 0, totalOutstanding: 0, activeLoans: 0 };

  const fund = await prisma.fund.findFirst({ where: { groupId } });
  if (!fund) return { totalLent: 0, totalOutstanding: 0, activeLoans: 0 };

  const allocations = await prisma.fundAllocation.findMany({
    where: { fundId: fund.id, targetType: "LOAN", loanId: { not: null } },
    include: {
      loan: true,
    },
  });

  let totalLent = 0;
  let totalOutstanding = 0;
  let activeLoans = 0;

  for (const alloc of allocations) {
    if (!alloc.loan) continue;

    totalLent += alloc.amount;

    if (alloc.loan.status === "ACTIVE" || alloc.loan.status === "DEFAULTED") {
      activeLoans++;
      if (alloc.loan.amount > 0) {
        const ratio = alloc.amount / alloc.loan.amount;
        totalOutstanding += Math.round(alloc.loan.remainingBalance * ratio);
      }
    }
  }

  return { totalLent, totalOutstanding, activeLoans };
}
