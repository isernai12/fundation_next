"use server"
import { getNow } from "@/lib/date";

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac";

import { getMonthlyMembershipFee } from "@/features/settings/actions";

export async function generateMissingContributions() {
  await requirePermission("Members", "Manage");
  const members = await prisma.member.findMany({
    where: { status: { not: "DELETED" } },
    select: {
      id: true,
      joinDate: true,
      status: true,
      statusHistory: {
        orderBy: { changedAt: "asc" }
      }
    }
  });

  const defaultAmount = await getMonthlyMembershipFee();

  const now = getNow();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  for (const member of members) {
    if (!member.joinDate) continue;

    const joinYear = member.joinDate.getFullYear();
    const joinMonth = member.joinDate.getMonth() + 1;

    // Find all existing regular contributions
    const existingList = await prisma.monthlyContribution.findMany({
      where: { memberId: member.id, isAdditional: false },
      select: { month: true, year: true }
    });
    
    const existingSet = new Set(existingList.map(e => `${e.year}-${e.month}`));

    const missingData = [];

    let tempY = joinYear;
    let tempM = joinMonth;

    while (tempY < currentYear || (tempY === currentYear && tempM <= currentMonth)) {
      if (!existingSet.has(`${tempY}-${tempM}`)) {
        // Calculate effective status at the end of month (tempY, tempM)
        const endOfMonth = new Date(tempY, tempM, 0, 23, 59, 59);

        let effectiveStatus = "ACTIVE"; // Initial state on joinDate
        for (const history of member.statusHistory) {
          if (history.changedAt <= endOfMonth) {
            effectiveStatus = history.toStatus;
          }
        }

        // If member currently INACTIVE and history log isn't present for past dates, check status
        if (member.statusHistory.length === 0 && member.status === "INACTIVE") {
          const monthStartDate = new Date(tempY, tempM - 1, 1);
          if (monthStartDate > member.joinDate) {
            effectiveStatus = "INACTIVE";
          }
        }

        // ONLY generate due if member was ACTIVE in that period
        if (effectiveStatus === "ACTIVE") {
          missingData.push({
            memberId: member.id,
            month: tempM,
            year: tempY,
            expectedAmount: defaultAmount,
            isAdditional: false,
            status: "PENDING"
          });
        }
      }

      tempM++;
      if (tempM > 12) {
        tempM = 1;
        tempY++;
      }
    }

    if (missingData.length > 0) {
      await prisma.monthlyContribution.createMany({
        data: missingData as any
      });
    }
  }
}

export async function getMemberDuesList() {
    await requirePermission("Members", "View");
  await generateMissingContributions();

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      group: true,
      contributions: {
        include: {
          payments: true
        }
      }
    }
  });

  return members.map(member => {
    let expectedContribution = 0;
    let totalPaid = 0;
    let lastPaymentDate: Date | null = null;
    let monthlyContribution = 0;

    // The most recent default contribution for this member could just be their latest monthly contribution's expectedAmount
    const regularConts = member.contributions.filter(c => !c.isAdditional).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    if (regularConts.length > 0) {
      monthlyContribution = regularConts[0].expectedAmount;
    }

    member.contributions.forEach(cont => {
      if (!cont.isAdditional) {
        expectedContribution += cont.expectedAmount;
      }
      cont.payments.forEach(payment => {
        totalPaid += payment.amount;
        if (!lastPaymentDate || payment.paymentDate > lastPaymentDate) {
          lastPaymentDate = payment.paymentDate;
        }
      });
    });

    let currentDue = expectedContribution - totalPaid;
    let advanceBalance = 0;
    let status = "Paid";

    if (currentDue > 0) {
      status = "Due";
    } else if (currentDue < 0) {
      advanceBalance = Math.abs(currentDue);
      currentDue = 0;
      status = "Advance";
    }

    return {
      id: member.id,
      memberId: member.memberId,
      name: `${member.fullName || ''}`.trim(),
      phone: member.mobile || member.phone || "",
      group: member.group?.name || "Unassigned",
      joinDate: member.joinDate,
      monthlyContribution,
      expectedContribution,
      paid: totalPaid,
      advanceBalance,
      currentDue,
      status,
      lastCollectionDate: lastPaymentDate,
      nextDueDate: null
    };
  });
}
