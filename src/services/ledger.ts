import { prisma } from "@/lib/prisma"
import { LedgerType, Prisma } from "@prisma/client"

export type LedgerEntryInput = {
  fundId: string
  isCredit: boolean
  amount: number
}

export type LedgerTransactionInput = {
  date: Date
  type: LedgerType
  referenceId?: string
  notes?: string
  createdBy?: string
  entries: LedgerEntryInput[]
}

export class LedgerEngine {
  /**
   * Creates a balanced double-entry ledger transaction.
   * Total Debits must exactly equal Total Credits.
   */
  static async createTransaction(data: LedgerTransactionInput, tx?: Omit<Prisma.TransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    const db = tx || prisma
    const totalDebit = data.entries.filter(e => !e.isCredit).reduce((acc, curr) => acc + curr.amount, 0)
    const totalCredit = data.entries.filter(e => e.isCredit).reduce((acc, curr) => acc + curr.amount, 0)

    if (totalDebit !== totalCredit) {
      throw new Error("Ledger entries must balance (Total Debit must equal Total Credit).")
    }

    if (totalDebit <= 0) {
      throw new Error("Transaction amount must be strictly positive.")
    }

    return await db.ledgerTransaction.create({
      data: {
        date: data.date,
        type: data.type,
        referenceId: data.referenceId,
        notes: data.notes,
        createdBy: data.createdBy,
        entries: {
          create: data.entries.map(e => ({
            fundId: e.fundId,
            isCredit: e.isCredit,
            amount: e.amount,
            createdBy: data.createdBy
          }))
        }
      },
      include: {
        entries: true
      }
    })
  }

  /**
   * Automatically fetches or creates a group's fund and the general fund
   */
  static async getOrCreateFunds(groupId: string, tx?: Omit<Prisma.TransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    const db = tx || prisma
    let groupFund = await db.fund.findFirst({
      where: { groupId }
    })
    
    if (!groupFund) {
      const group = await db.group.findUnique({ where: { id: groupId }})
      if (!group) throw new Error("Group not found")
      groupFund = await db.fund.create({
        data: {
          groupId,
          name: `${group.name} Fund`,
          description: `Auto-generated fund for ${group.name}`
        }
      })
    }

    let generalFund = await db.fund.findFirst({
      where: { groupId: null }
    })

    if (!generalFund) {
      generalFund = await db.fund.create({
        data: {
          name: "General Foundation Fund",
          description: "Main unallocated asset pool"
        }
      })
    }

    return { groupFund, generalFund }
  }
}
