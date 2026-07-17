"use server"

import { prisma } from "@/lib/prisma"

export async function generateMissingContributions() {
  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, joinDate: true }
  });

  const setting = await prisma.systemSettings.findFirst({ where: { key: "DEFAULT_MONTHLY_CONTRIBUTION" } });
  const defaultAmount = setting ? parseInt(setting.value) : 100;

  const now = new Date();
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
        missingData.push({
          memberId: member.id,
          month: tempM,
          year: tempY,
          expectedAmount: defaultAmount,
          isAdditional: false,
          status: "PENDING"
        });
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
      if (totalPaid > 0) status = "Partial";
      else status = "Due";
    } else if (currentDue < 0) {
      advanceBalance = Math.abs(currentDue);
      currentDue = 0;
      status = "Advance";
    }

    return {
      id: member.id,
      memberId: member.memberId,
      name: `${member.firstName} ${member.lastName}`.trim(),
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
