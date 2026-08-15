"use server";

import { requirePermission } from "@/lib/rbac";
import { membersApi, settingsApi } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";

export async function generateMissingContributions() {
  // Maintained for backward compatibility - FastAPI manages contribution generation and calculation
  return;
}

export async function getMemberDuesList() {
  await requirePermission("Members", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const [membersRes, defaultFee] = await Promise.all([
      membersApi.list({ page_size: 1000 }, token),
      settingsApi.getMonthlyMembershipFee(token),
    ]);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return membersRes.items.map((member) => {
      const joinDate = member.join_date ? new Date(member.join_date) : null;
      let monthsSinceJoin = 1;
      if (joinDate) {
        monthsSinceJoin = Math.max(
          1,
          (currentYear - joinDate.getFullYear()) * 12 + (currentMonth - (joinDate.getMonth() + 1)) + 1
        );
      }

      const expectedContribution = monthsSinceJoin * defaultFee;
      const paidUntilMonth = member.paid_until_month || 0;
      const paidUntilYear = member.paid_until_year || 0;

      let monthsPaid = 0;
      if (paidUntilYear > 0 && joinDate) {
        monthsPaid = Math.max(
          0,
          (paidUntilYear - joinDate.getFullYear()) * 12 + (paidUntilMonth - (joinDate.getMonth() + 1)) + 1
        );
      }

      const totalPaid = monthsPaid * defaultFee;
      const currentDue = Math.max(0, expectedContribution - totalPaid);
      const advanceBalance = Math.max(0, totalPaid - expectedContribution);
      const status = currentDue > 0 ? "Due" : advanceBalance > 0 ? "Advance" : "Paid";

      return {
        id: member.id,
        memberId: member.member_id,
        name: `${member.full_name || ""}`.trim(),
        phone: member.mobile || member.phone || "",
        group: member.group_name || "Unassigned",
        joinDate: joinDate,
        monthlyContribution: defaultFee,
        expectedContribution,
        paid: totalPaid,
        advanceBalance,
        currentDue,
        status,
        lastCollectionDate: null,
        nextDueDate: null,
      };
    });
  } catch (error) {
    console.error("[MemberDues] Failed to fetch member dues list:", error);
    return [];
  }
}
