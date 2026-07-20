"use server"
import { formatShortMonth } from "@/lib/format"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  const [
    totalMembers,
    activeMembers,
    totalGroups,
    totalBeneficiaries,
    totalActiveLoans,
    totalGrants,
    funds,
    loans
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.group.count(),
    prisma.beneficiary.count(),
    prisma.loan.count({ where: { status: "ACTIVE" } }),
    prisma.grant.count(),
    prisma.fund.findMany({ include: { ledgerLines: true, group: true } }),
    prisma.loan.findMany({ where: { status: { in: ["ACTIVE", "DEFAULTED"] } }, include: { repayments: true } })
  ])

  let currentCashBalance = 0
  let foundationTotalFund = 0
  let totalGroupFunds = 0

  const groupFundDistribution: { name: string, value: number }[] = []

  for (const fund of funds) {
    let balance = 0
    for (const entry of fund.ledgerLines) {
      // Logic from ledger service: 
      // If it's a general fund (no group), it's Cash (Asset). Debits increase it, Credits decrease it. Wait, the ledger service logic was:
      // Foundation Fund (Cash): Credit -> Reduces Asset. Debit -> Increases Asset.
      // Wait, let's re-read what Ledger service did:
      // In Contribution: Debit Cash, Credit Group Fund
      // Debit Cash = IsCredit: false -> Increases Cash.
      // So IsCredit: false => + amount, IsCredit: true => - amount.
      if (!entry.isCredit) balance += entry.amount
      else balance -= entry.amount
    }

    if (!fund.groupId) {
      foundationTotalFund = balance
      currentCashBalance = balance
    } else {
      // For Group funds (Equity), Credit increases, Debit decreases.
      // Wait, in Contribution: Credit Group Fund (IsCredit: true).
      // So for Equity: IsCredit: true => + amount, IsCredit: false => - amount.
      let equityBalance = 0
      for (const entry of fund.ledgerLines) {
        if (entry.isCredit) equityBalance += entry.amount
        else equityBalance -= entry.amount
      }
      totalGroupFunds += equityBalance
      groupFundDistribution.push({ name: fund.group?.name || "Unknown", value: equityBalance })
    }
  }

  let outstandingLoanAmount = 0
  for (const loan of loans) {
    const repaid = loan.repayments.reduce((s, r) => s + r.amount, 0)
    outstandingLoanAmount += (loan.amount - repaid)
  }

  const contributions = await prisma.monthlyContribution.aggregate({
    _sum: { expectedAmount: true },
    where: { status: "PAID" }
  })

  // Monthly data for charts (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentContributions = await prisma.monthlyContribution.findMany({
    where: { status: "PAID", createdAt: { gte: sixMonthsAgo } },
    select: { expectedAmount: true, createdAt: true }
  })

  const recentLoans = await prisma.loan.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { amount: true, createdAt: true }
  })

  const recentGrants = await prisma.grant.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { amount: true, createdAt: true }
  })

  // Group by month
  const monthMap = new Map<string, { month: string, contributions: number, loans: number, grants: number }>()
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStr = formatShortMonth(new Date(d).getUTCMonth())
    monthMap.set(monthStr, { month: monthStr, contributions: 0, loans: 0, grants: 0 })
  }

  for (const c of recentContributions) {
    const m = formatShortMonth(new Date(c.createdAt).getUTCMonth())
    if (monthMap.has(m)) monthMap.get(m)!.contributions += (c.expectedAmount)
  }
  for (const l of recentLoans) {
    const m = formatShortMonth(new Date(l.createdAt).getUTCMonth())
    if (monthMap.has(m)) monthMap.get(m)!.loans += (l.amount)
  }
  for (const g of recentGrants) {
    const m = formatShortMonth(new Date(g.createdAt).getUTCMonth())
    if (monthMap.has(m)) monthMap.get(m)!.grants += (g.amount)
  }

  return {
    totalMembers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
    totalGroups,
    foundationTotalFund,
    totalGroupFunds,
    currentCashBalance,
    totalContributions: contributions._sum.expectedAmount || 0,
    totalActiveLoans,
    outstandingLoanAmount,
    totalGrants,
    totalBeneficiaries,
    groupFundDistribution,
    monthlyChartData: Array.from(monthMap.values())
  }
}
