"use server"

import { prisma } from "@/lib/prisma"
import { LedgerEngine } from "@/services/ledger"
import { requirePermission, checkPermission } from "@/lib/rbac"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  contributionRefundSchema,
  contributionAdjustmentSchema,
  type ContributionRefundFormValues,
  type ContributionAdjustmentFormValues,
} from "./schema"

export type ContributionLedgerItem = {
  id: string
  paymentDate: string
  receiptNo: string
  memberId: string
  memberDbId: string
  memberName: string
  mobile: string
  contributionType: "REGULAR" | "ADDITIONAL" | "REFUND" | "ADJUSTMENT"
  debit: number
  credit: number
  balance: number
  paymentMethod: string
  collector: string
  remarks: string
}

export type LedgerSummaryStats = {
  totalContributions: number
  totalRefund: number
  totalAdjustment: number
  currentBalance: number
  totalTransactions: number
}

export type ContributionLedgerQueryParams = {
  search?: string
  from?: string
  to?: string
  memberId?: string
  type?: string // REGULAR, ADDITIONAL, REFUND, ADJUSTMENT
  collector?: string
  paymentMethod?: string
  page?: number
  limit?: number
}

export async function getContributionLedger(params: ContributionLedgerQueryParams) {
  if (!await checkPermission("Fund Collection", "View")) {
    return {
      items: [],
      summary: {
        totalContributions: 0,
        totalRefund: 0,
        totalAdjustment: 0,
        currentBalance: 0,
        totalTransactions: 0,
      },
      previousBalance: 0,
      pagination: {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 0,
      },
    }
  }

  const page = Math.max(1, params.page || 1)
  const limit = Math.max(1, Math.min(100, params.limit || 15))
  const skip = (page - 1) * limit

  // Construct base filter
  const where: any = {}

  // Date range filter
  if (params.from || params.to) {
    where.paymentDate = {}
    if (params.from) {
      where.paymentDate.gte = new Date(params.from)
    }
    if (params.to) {
      const toDate = new Date(params.to)
      toDate.setHours(23, 59, 59, 999)
      where.paymentDate.lte = toDate
    }
  }

  // Payment method
  if (params.paymentMethod && params.paymentMethod !== "ALL") {
    where.paymentMethod = params.paymentMethod
  }

  // Collector
  if (params.collector && params.collector !== "ALL") {
    where.createdBy = params.collector
  }

  // Member filter
  if (params.memberId && params.memberId !== "ALL") {
    where.monthlyContribution = {
      ...(where.monthlyContribution || {}),
      memberId: params.memberId,
    }
  }

  // Search query filter (member name, memberId, mobile, receipt no, notes)
  if (params.search && params.search.trim() !== "") {
    const q = params.search.trim()
    where.OR = [
      { referenceNumber: { contains: q } },
      { notes: { contains: q } },
      {
        monthlyContribution: {
          member: {
            OR: [
              { fullName: { contains: q } },
              { memberId: { contains: q } },
              { mobile: { contains: q } },
            ],
          },
        },
      },
      {
        ledgerTransaction: {
          OR: [
            { referenceId: { contains: q } },
            { notes: { contains: q } },
          ],
        },
      },
    ]
  }

  // Contribution Type filter
  if (params.type && params.type !== "ALL") {
    if (params.type === "REGULAR") {
      where.monthlyContribution = {
        ...(where.monthlyContribution || {}),
        isAdditional: false,
      }
      where.ledgerTransaction = {
        type: { notIn: ["CONTRIBUTION_REFUND", "REFUND", "CONTRIBUTION_ADJUSTMENT", "ADJUSTMENT"] },
      }
    } else if (params.type === "ADDITIONAL") {
      where.monthlyContribution = {
        ...(where.monthlyContribution || {}),
        isAdditional: true,
      }
      where.ledgerTransaction = {
        type: { notIn: ["CONTRIBUTION_REFUND", "REFUND", "CONTRIBUTION_ADJUSTMENT", "ADJUSTMENT"] },
      }
    } else if (params.type === "REFUND") {
      where.ledgerTransaction = {
        type: { in: ["CONTRIBUTION_REFUND", "REFUND"] },
      }
    } else if (params.type === "ADJUSTMENT") {
      where.ledgerTransaction = {
        type: { in: ["CONTRIBUTION_ADJUSTMENT", "ADJUSTMENT"] },
      }
    }
  }

  // Get total matching count
  const total = await prisma.contributionPayment.count({ where })

  // Query paginated items
  const rawPayments = await prisma.contributionPayment.findMany({
    where,
    orderBy: [
      { paymentDate: "asc" },
      { createdAt: "asc" },
    ],
    skip,
    take: limit,
    include: {
      monthlyContribution: {
        include: {
          member: {
            include: {
              group: { select: { name: true, code: true } },
            },
          },
        },
      },
      ledgerTransaction: true,
    },
  })

  // Calculate Previous Balance before this page / date filter
  // 1. If 'from' date is set, compute sum before 'from'
  let previousBalance = 0

  if (params.from) {
    const priorWhere = {
      ...where,
      paymentDate: {
        lt: new Date(params.from),
      },
    }
    const priorPayments = await prisma.contributionPayment.findMany({
      where: priorWhere,
      select: {
        amount: true,
        monthlyContribution: { select: { isAdditional: true } },
        ledgerTransaction: { select: { type: true } },
      },
    })

    for (const p of priorPayments) {
      const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
      if (txType === "CONTRIBUTION_REFUND" || txType === "REFUND") {
        previousBalance -= p.amount
      } else if (txType === "CONTRIBUTION_ADJUSTMENT" || txType === "ADJUSTMENT") {
        previousBalance += p.amount
      } else {
        previousBalance += p.amount
      }
    }
  }

  // 2. If skip > 0, compute sum of previous pages
  if (skip > 0) {
    const pagePriorPayments = await prisma.contributionPayment.findMany({
      where,
      orderBy: [
        { paymentDate: "asc" },
        { createdAt: "asc" },
      ],
      take: skip,
      select: {
        amount: true,
        monthlyContribution: { select: { isAdditional: true } },
        ledgerTransaction: { select: { type: true } },
      },
    })

    for (const p of pagePriorPayments) {
      const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
      if (txType === "CONTRIBUTION_REFUND" || txType === "REFUND") {
        previousBalance -= p.amount
      } else if (txType === "CONTRIBUTION_ADJUSTMENT" || txType === "ADJUSTMENT") {
        previousBalance += p.amount
      } else {
        previousBalance += p.amount
      }
    }
  }

  // Compute Summary Cards Stats across ALL matching records (not just page slice)
  const allMatchingPayments = await prisma.contributionPayment.findMany({
    where,
    select: {
      amount: true,
      monthlyContribution: { select: { isAdditional: true } },
      ledgerTransaction: { select: { type: true } },
    },
  })

  let totalContributions = 0
  let totalRefund = 0
  let totalAdjustment = 0

  for (const p of allMatchingPayments) {
    const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
    if (txType === "CONTRIBUTION_REFUND" || txType === "REFUND") {
      totalRefund += p.amount
    } else if (txType === "CONTRIBUTION_ADJUSTMENT" || txType === "ADJUSTMENT") {
      totalAdjustment += p.amount
    } else {
      totalContributions += p.amount
    }
  }

  const currentBalance = totalContributions - totalRefund + totalAdjustment

  // Build items with running balance
  let runningBalance = previousBalance

  const items: ContributionLedgerItem[] = rawPayments.map((p) => {
    const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
    const isRefund = txType === "CONTRIBUTION_REFUND" || txType === "REFUND"
    const isAdjustment = txType === "CONTRIBUTION_ADJUSTMENT" || txType === "ADJUSTMENT"

    let contributionType: "REGULAR" | "ADDITIONAL" | "REFUND" | "ADJUSTMENT" = "REGULAR"
    let debit = 0
    let credit = 0

    if (isRefund) {
      contributionType = "REFUND"
      debit = p.amount
      credit = 0
    } else if (isAdjustment) {
      contributionType = "ADJUSTMENT"
      if (p.amount >= 0) {
        credit = p.amount
        debit = 0
      } else {
        debit = Math.abs(p.amount)
        credit = 0
      }
    } else if (p.monthlyContribution?.isAdditional) {
      contributionType = "ADDITIONAL"
      credit = p.amount
      debit = 0
    } else {
      contributionType = "REGULAR"
      credit = p.amount
      debit = 0
    }

    runningBalance += credit - debit

    const receiptNo =
      p.referenceNumber ||
      p.ledgerTransaction?.referenceId ||
      `REC-${p.id.substring(0, 8).toUpperCase()}`

    const member = p.monthlyContribution?.member

    return {
      id: p.id,
      paymentDate: p.paymentDate.toISOString(),
      receiptNo,
      memberId: member?.memberId || "N/A",
      memberDbId: member?.id || "",
      memberName: member?.fullName || "General Member",
      mobile: member?.mobile || "-",
      contributionType,
      debit,
      credit,
      balance: runningBalance,
      paymentMethod: p.paymentMethod || "CASH",
      collector: p.createdBy || p.ledgerTransaction?.createdBy || "System Admin",
      remarks: p.notes || p.ledgerTransaction?.notes || "",
    }
  })

  return {
    items,
    summary: {
      totalContributions,
      totalRefund,
      totalAdjustment,
      currentBalance,
      totalTransactions: total,
    },
    previousBalance,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getMemberContributionLedger(memberId: string, params?: { from?: string; to?: string; page?: number; limit?: number }) {
  await requirePermission("Fund Collection", "View")

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { group: { select: { name: true, code: true } } },
  })

  if (!member) {
    throw new Error("Member not found")
  }

  const page = Math.max(1, params?.page || 1)
  const limit = Math.max(1, Math.min(100, params?.limit || 20))
  const skip = (page - 1) * limit

  const where: any = {
    monthlyContribution: {
      memberId,
    },
  }

  if (params?.from || params?.to) {
    where.paymentDate = {}
    if (params?.from) where.paymentDate.gte = new Date(params.from)
    if (params?.to) {
      const toDate = new Date(params.to)
      toDate.setHours(23, 59, 59, 999)
      where.paymentDate.lte = toDate
    }
  }

  const total = await prisma.contributionPayment.count({ where })

  // Overall member totals
  const allMemberPayments = await prisma.contributionPayment.findMany({
    where: { monthlyContribution: { memberId } },
    select: {
      amount: true,
      paymentDate: true,
      monthlyContribution: { select: { isAdditional: true } },
      ledgerTransaction: { select: { type: true } },
    },
  })

  let overallContributions = 0
  let overallRefunds = 0
  let overallAdjustments = 0

  for (const p of allMemberPayments) {
    const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
    if (txType === "CONTRIBUTION_REFUND" || txType === "REFUND") {
      overallRefunds += p.amount
    } else if (txType === "CONTRIBUTION_ADJUSTMENT" || txType === "ADJUSTMENT") {
      overallAdjustments += p.amount
    } else {
      overallContributions += p.amount
    }
  }

  const closingBalance = overallContributions - overallRefunds + overallAdjustments

  // Compute Previous Balance before 'from' date or prior page
  let previousBalance = 0

  if (params?.from) {
    const priorPayments = await prisma.contributionPayment.findMany({
      where: {
        monthlyContribution: { memberId },
        paymentDate: { lt: new Date(params.from) },
      },
      select: {
        amount: true,
        ledgerTransaction: { select: { type: true } },
      },
    })
    for (const p of priorPayments) {
      const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
      if (txType === "CONTRIBUTION_REFUND" || txType === "REFUND") {
        previousBalance -= p.amount
      } else {
        previousBalance += p.amount
      }
    }
  }

  if (skip > 0) {
    const pagePriorPayments = await prisma.contributionPayment.findMany({
      where,
      orderBy: [
        { paymentDate: "asc" },
        { createdAt: "asc" },
      ],
      take: skip,
      select: {
        amount: true,
        ledgerTransaction: { select: { type: true } },
      },
    })
    for (const p of pagePriorPayments) {
      const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
      if (txType === "CONTRIBUTION_REFUND" || txType === "REFUND") {
        previousBalance -= p.amount
      } else {
        previousBalance += p.amount
      }
    }
  }

  // Fetch paginated member payments
  const rawPayments = await prisma.contributionPayment.findMany({
    where,
    orderBy: [
      { paymentDate: "asc" },
      { createdAt: "asc" },
    ],
    skip,
    take: limit,
    include: {
      monthlyContribution: true,
      ledgerTransaction: true,
    },
  })

  let runningBalance = previousBalance

  const items: ContributionLedgerItem[] = rawPayments.map((p) => {
    const txType = p.ledgerTransaction?.type || "CONTRIBUTION"
    const isRefund = txType === "CONTRIBUTION_REFUND" || txType === "REFUND"
    const isAdjustment = txType === "CONTRIBUTION_ADJUSTMENT" || txType === "ADJUSTMENT"

    let contributionType: "REGULAR" | "ADDITIONAL" | "REFUND" | "ADJUSTMENT" = "REGULAR"
    let debit = 0
    let credit = 0

    if (isRefund) {
      contributionType = "REFUND"
      debit = p.amount
      credit = 0
    } else if (isAdjustment) {
      contributionType = "ADJUSTMENT"
      if (p.amount >= 0) {
        credit = p.amount
        debit = 0
      } else {
        debit = Math.abs(p.amount)
        credit = 0
      }
    } else if (p.monthlyContribution?.isAdditional) {
      contributionType = "ADDITIONAL"
      credit = p.amount
      debit = 0
    } else {
      contributionType = "REGULAR"
      credit = p.amount
      debit = 0
    }

    runningBalance += credit - debit

    const receiptNo =
      p.referenceNumber ||
      p.ledgerTransaction?.referenceId ||
      `REC-${p.id.substring(0, 8).toUpperCase()}`

    return {
      id: p.id,
      paymentDate: p.paymentDate.toISOString(),
      receiptNo,
      memberId: member.memberId,
      memberDbId: member.id,
      memberName: member.fullName || "General Member",
      mobile: member.mobile || "-",
      contributionType,
      debit,
      credit,
      balance: runningBalance,
      paymentMethod: p.paymentMethod || "CASH",
      collector: p.createdBy || p.ledgerTransaction?.createdBy || "System Admin",
      remarks: p.notes || p.ledgerTransaction?.notes || "",
    }
  })

  return {
    member: {
      id: member.id,
      memberId: member.memberId,
      fullName: member.fullName || "General Member",
      mobile: member.mobile || "-",
      groupName: member.group?.name || "General Group",
      groupCode: member.group?.code || "",
      status: member.status,
    },
    items,
    summary: {
      previousBalance,
      totalContributions: overallContributions,
      totalRefunds: overallRefunds,
      totalAdjustments: overallAdjustments,
      closingBalance,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function createContributionRefund(data: ContributionRefundFormValues) {
  await requirePermission("Fund Collection", "Add")
  const parsed = contributionRefundSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "অবৈধ তথ্য প্রদান করা হয়েছে" }
  }
  const pd = parsed.data

  const session = await getAuthSession()
  const collector = (session?.user as any)?.name || (session?.user as any)?.username || "Admin"

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: pd.memberId } })
      if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি")

      // Find or create a monthly contribution record for refund tracking
      const d = new Date(pd.paymentDate)
      const month = d.getMonth() + 1
      const year = d.getFullYear()

      let mc = await tx.monthlyContribution.findFirst({
        where: { memberId: pd.memberId, month, year, isAdditional: true },
      })

      if (!mc) {
        mc = await tx.monthlyContribution.create({
          data: {
            memberId: pd.memberId,
            month,
            year,
            expectedAmount: pd.amount,
            isAdditional: true,
            status: "PAID",
            createdBy: collector,
          },
        })
      }

      const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx)

      // Refund: Money goes OUT of Group Fund (Debit Group Fund, Credit Cash/General)
      const refNo = pd.referenceNumber || `RFD-${Date.now()}`
      const ledgerTx = await LedgerEngine.createTransaction(
        {
          date: new Date(pd.paymentDate),
          type: "CONTRIBUTION_REFUND",
          referenceId: refNo,
          notes: pd.notes || "Contribution Refund",
          createdBy: collector,
          entries: [
            { fundId: groupFund.id, isCredit: false, amount: pd.amount }, // Debit Group Fund
            { fundId: generalFund.id, isCredit: true, amount: pd.amount }, // Credit Cash
          ],
        },
        tx
      )

      await tx.contributionPayment.create({
        data: {
          monthlyContributionId: mc.id,
          ledgerTransactionId: ledgerTx.id,
          amount: pd.amount,
          paymentDate: new Date(pd.paymentDate),
          paymentMethod: pd.paymentMethod,
          referenceNumber: refNo,
          notes: pd.notes,
          createdBy: collector,
        },
      })

      return { success: true, memberGroupId: member.groupId }
    })

    if (result.success) {
      revalidatePath("/contributions")
      revalidatePath("/contributions/ledger")
      revalidatePath(`/members/${pd.memberId}`)
    }

    return result
  } catch (error: any) {
    console.error("Error creating contribution refund:", error)
    return { success: false, error: error.message || "ফেরত প্রক্রিয়া করতে ব্যর্থ হয়েছে" }
  }
}

export async function createContributionAdjustment(data: ContributionAdjustmentFormValues) {
  await requirePermission("Fund Collection", "Add")
  const parsed = contributionAdjustmentSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "অবৈধ তথ্য প্রদান করা হয়েছে" }
  }
  const pd = parsed.data

  const session = await getAuthSession()
  const collector = (session?.user as any)?.name || (session?.user as any)?.username || "Admin"

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: pd.memberId } })
      if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি")

      const d = new Date(pd.paymentDate)
      const month = d.getMonth() + 1
      const year = d.getFullYear()

      let mc = await tx.monthlyContribution.findFirst({
        where: { memberId: pd.memberId, month, year, isAdditional: true },
      })

      if (!mc) {
        mc = await tx.monthlyContribution.create({
          data: {
            memberId: pd.memberId,
            month,
            year,
            expectedAmount: pd.amount,
            isAdditional: true,
            status: "PAID",
            createdBy: collector,
          },
        })
      }

      const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx)
      const isCredit = pd.adjustmentType === "CREDIT"
      const refNo = pd.referenceNumber || `ADJ-${Date.now()}`

      const ledgerTx = await LedgerEngine.createTransaction(
        {
          date: new Date(pd.paymentDate),
          type: "CONTRIBUTION_ADJUSTMENT",
          referenceId: refNo,
          notes: pd.notes || "Contribution Adjustment",
          createdBy: collector,
          entries: isCredit
            ? [
                { fundId: generalFund.id, isCredit: false, amount: pd.amount },
                { fundId: groupFund.id, isCredit: true, amount: pd.amount },
              ]
            : [
                { fundId: groupFund.id, isCredit: false, amount: pd.amount },
                { fundId: generalFund.id, isCredit: true, amount: pd.amount },
              ],
        },
        tx
      )

      await tx.contributionPayment.create({
        data: {
          monthlyContributionId: mc.id,
          ledgerTransactionId: ledgerTx.id,
          amount: pd.amount,
          paymentDate: new Date(pd.paymentDate),
          paymentMethod: pd.paymentMethod,
          referenceNumber: refNo,
          notes: pd.notes,
          createdBy: collector,
        },
      })

      return { success: true }
    })

    if (result.success) {
      revalidatePath("/contributions")
      revalidatePath("/contributions/ledger")
      revalidatePath(`/members/${pd.memberId}`)
    }

    return result
  } catch (error: any) {
    console.error("Error creating contribution adjustment:", error)
    return { success: false, error: error.message || "সমন্বয় প্রক্রিয়া করতে ব্যর্থ হয়েছে" }
  }
}

export async function getContributionLedgerFilterOptions() {
  if (!await checkPermission("Fund Collection", "View")) {
    return { members: [], collectors: [], paymentMethods: [] }
  }

  const members = await prisma.member.findMany({
    where: { status: { not: "DELETED" } },
    select: { id: true, memberId: true, fullName: true },
    orderBy: { fullName: "asc" },
  })

  const rawCollectors = await prisma.contributionPayment.findMany({
    select: { createdBy: true },
    distinct: ["createdBy"],
  })
  const collectors = rawCollectors.map((c) => c.createdBy).filter(Boolean) as string[]

  const rawMethods = await prisma.contributionPayment.findMany({
    select: { paymentMethod: true },
    distinct: ["paymentMethod"],
  })
  const paymentMethods = rawMethods.map((m) => m.paymentMethod).filter(Boolean) as string[]

  return {
    members,
    collectors,
    paymentMethods,
  }
}

export async function exportContributionLedgerCSV(params: ContributionLedgerQueryParams) {
  await requirePermission("Fund Collection", "Export")

  const result = await getContributionLedger({ ...params, page: 1, limit: 10000 })
  const headers = [
    "Date",
    "Receipt No",
    "Member ID",
    "Member Name",
    "Mobile",
    "Contribution Type",
    "Debit",
    "Credit",
    "Running Balance",
    "Payment Method",
    "Collector",
    "Remarks",
  ]

  const rows = result.items.map((item) => [
    `"${item.paymentDate.split("T")[0]}"`,
    `"${item.receiptNo}"`,
    `"${item.memberId}"`,
    `"${item.memberName.replace(/"/g, '""')}"`,
    `"${item.mobile}"`,
    `"${item.contributionType}"`,
    item.debit,
    item.credit,
    item.balance,
    `"${item.paymentMethod}"`,
    `"${item.collector}"`,
    `"${item.remarks.replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  return csvContent
}
