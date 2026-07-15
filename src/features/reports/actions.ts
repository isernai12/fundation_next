"use server"

import { prisma } from "@/lib/prisma"

export async function getFoundationSummaryReport() {
  const funds = await prisma.fund.findMany({
    include: { group: true, ledgerLines: true }
  })

  return funds.map(fund => {
    let balance = 0
    // Simplified logic for summary
    for (const entry of fund.ledgerLines) {
      if (!fund.groupId) {
        // Foundation Cash: Debit increases, Credit decreases
        if (!entry.isCredit) balance += entry.amount
        else balance -= entry.amount
      } else {
        // Group Equity: Credit increases, Debit decreases
        if (entry.isCredit) balance += entry.amount
        else balance -= entry.amount
      }
    }

    return {
      id: fund.id,
      fundName: fund.name,
      groupName: fund.group?.name || "Foundation (General)",
      type: fund.groupId ? "Equity" : "Asset",
      balance: balance
    }
  })
}

export async function getGeneralLedgerReport() {
  const entries = await prisma.ledgerTransaction.findMany({
    include: {
      entries: { include: { fund: { include: { group: true } } } }
    },
    orderBy: { date: "desc" },
    take: 1000 // Limit for performance in UI
  })

  const reportData: any[] = []
  for (const tx of entries) {
    for (const e of tx.entries) {
      reportData.push({
        id: e.id,
        date: tx.date,
        type: tx.type,
        referenceId: tx.referenceId,
        fund: e.fund.name,
        group: e.fund.group?.name || "Foundation",
        debit: !e.isCredit ? e.amount : 0,
        credit: e.isCredit ? e.amount : 0,
        notes: tx.notes
      })
    }
  }

  return reportData
}

export async function getMemberDirectoryReport() {
  const members = await prisma.member.findMany({
    include: { group: true },
    orderBy: { memberId: "asc" }
  })

  return members.map(m => ({
    memberId: m.memberId,
    name: `${m.firstName} ${m.lastName}`,
    group: m.group?.name || "No Group",
    mobile: m.mobile,
    email: m.email || "N/A",
    status: m.status,
    joinDate: m.joinDate
  }))
}
