"use server"

import { prisma } from "@/lib/prisma"
import { contributionSchema, type ContributionFormValues } from "./schema"
import { LedgerEngine } from "@/services/ledger"
import { revalidatePath } from "next/cache"

export async function createContribution(data: ContributionFormValues) {
  const parsed = contributionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  
  const pd = parsed.data

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Get member to ensure they exist and get their group
      const member = await tx.member.findUnique({ where: { id: pd.memberId } })
      if (!member) throw new Error("Member not found")

      let monthlyContribution = null;

      // 2. Check for duplicate contribution unless explicitly marked as additional
      if (!pd.isAdditional) {
        const existing = await tx.monthlyContribution.findFirst({
          where: {
            memberId: pd.memberId,
            month: pd.month,
            year: pd.year,
            isAdditional: false,
          }
        })
        
        if (existing) {
          if (existing.status === "PAID") {
            throw new Error("This contribution is already fully paid. Use 'Additional Payment' for extra contributions.")
          }
          // If it's PENDING or PARTIAL, we can update it
          monthlyContribution = await tx.monthlyContribution.update({
            where: { id: existing.id },
            data: {
              status: pd.status, // Update to PAID or PARTIAL
              // Optionally update expectedAmount if needed, but usually we just add payments
            }
          })
        }
      }

      // 3. Create Monthly Contribution Agreement if it doesn't exist
      if (!monthlyContribution) {
        monthlyContribution = await tx.monthlyContribution.create({
          data: {
            memberId: pd.memberId,
            month: pd.month,
            year: pd.year,
            expectedAmount: pd.amount,
            isAdditional: pd.isAdditional,
            status: pd.status,
          }
        })
      }

      // 4. Only process Ledger and Payment if Status is PAID or PARTIAL
      if (pd.status === "PAID" || pd.status === "PARTIAL") {
        // Prevent duplicate payment processing if they submit the exact same reference by accident
        if (pd.referenceNumber) {
          const existingPayment = await tx.contributionPayment.findFirst({
            where: { referenceNumber: pd.referenceNumber }
          })
          if (existingPayment) throw new Error("A payment with this reference number has already been recorded.")
        }

        // Prepare Funds
        const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx)

        // Create Ledger Transaction
        const ledgerTx = await LedgerEngine.createTransaction({
          date: new Date(pd.paymentDate),
          type: "CONTRIBUTION",
          referenceId: pd.referenceNumber,
          notes: pd.notes,
          entries: [
            { fundId: generalFund.id, isCredit: false, amount: pd.amount }, // Debit Cash/Asset
            { fundId: groupFund.id, isCredit: true, amount: pd.amount }     // Credit Group Equity
          ]
        }, tx)

        // Create Contribution Payment strictly bound to the Ledger Transaction
        await tx.contributionPayment.create({
          data: {
            monthlyContributionId: monthlyContribution.id,
            ledgerTransactionId: ledgerTx.id,
            amount: pd.amount,
            paymentDate: new Date(pd.paymentDate),
            paymentMethod: pd.paymentMethod,
            referenceNumber: pd.referenceNumber,
            notes: pd.notes,
          }
        })
      }

      revalidatePath("/contributions")
      revalidatePath(`/members/${member.id}`)
      revalidatePath(`/groups/${member.groupId}`)
      revalidatePath("/")
      return { success: true, error: undefined }
    })
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to process contribution" }
  }
}

export async function getContributions() {
  return prisma.monthlyContribution.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: { fullName: true, memberId: true, group: { select: { name: true, code: true } } }
      },
      payments: true,
    }
  })
}

export async function updateContribution(id: string, data: ContributionFormValues) {
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };
  const pd = parsed.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true }
      });
      if (!contribution) throw new Error("Contribution not found");

      const member = await tx.member.findUnique({ where: { id: pd.memberId } });
      if (!member) throw new Error("Member not found");

      // Update Monthly Contribution
      const updatedContribution = await tx.monthlyContribution.update({
        where: { id },
        data: {
          memberId: pd.memberId,
          month: pd.month,
          year: pd.year,
          expectedAmount: pd.amount,
          isAdditional: pd.isAdditional,
          status: pd.status,
        }
      });

      // Handle payments & ledger updates
      // Note: We assume only 1 payment for simplicity in this MVP context unless multiple exist.
      // If payment exists, update it. If not, and status is PAID/PARTIAL, create it.
      if (pd.status === "PAID" || pd.status === "PARTIAL") {
        const existingPayment = contribution.payments[0];
        
        if (existingPayment) {
          // Check if reference changed and already exists elsewhere
          if (pd.referenceNumber && pd.referenceNumber !== existingPayment.referenceNumber) {
             const refExists = await tx.contributionPayment.findFirst({ where: { referenceNumber: pd.referenceNumber, id: { not: existingPayment.id } }});
             if (refExists) throw new Error("Reference number already in use.");
          }

          const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx);
          
          await tx.contributionPayment.update({
            where: { id: existingPayment.id },
            data: {
              amount: pd.amount,
              paymentDate: new Date(pd.paymentDate),
              paymentMethod: pd.paymentMethod,
              referenceNumber: pd.referenceNumber,
              notes: pd.notes,
            }
          });

          // Update Ledger
          await tx.ledgerTransaction.update({
            where: { id: existingPayment.ledgerTransactionId },
            data: {
              date: new Date(pd.paymentDate),
              referenceId: pd.referenceNumber,
              notes: pd.notes,
            }
          });

          // Update Ledger Entries (Debit & Credit)
          const entries = await tx.ledgerEntry.findMany({ where: { transactionId: existingPayment.ledgerTransactionId } });
          for (const entry of entries) {
            await tx.ledgerEntry.update({
              where: { id: entry.id },
              data: { amount: pd.amount }
            });
          }
        } else {
           // It didn't have a payment but now it does
           const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx);
           const ledgerTx = await LedgerEngine.createTransaction({
              date: new Date(pd.paymentDate),
              type: "CONTRIBUTION",
              referenceId: pd.referenceNumber,
              notes: pd.notes,
              entries: [
                { fundId: generalFund.id, isCredit: false, amount: pd.amount }, 
                { fundId: groupFund.id, isCredit: true, amount: pd.amount }
              ]
            }, tx);
            await tx.contributionPayment.create({
              data: {
                monthlyContributionId: contribution.id,
                ledgerTransactionId: ledgerTx.id,
                amount: pd.amount,
                paymentDate: new Date(pd.paymentDate),
                paymentMethod: pd.paymentMethod,
                referenceNumber: pd.referenceNumber,
                notes: pd.notes,
              }
            });
        }
      } else {
        // Status is PENDING or CANCELLED, remove any existing payments and ledger
        if (contribution.payments.length > 0) {
          for (const payment of contribution.payments) {
            await tx.contributionPayment.delete({ where: { id: payment.id } });
            await tx.ledgerTransaction.delete({ where: { id: payment.ledgerTransactionId } }); // cascades to entries
          }
        }
      }

      revalidatePath("/contributions");
      revalidatePath(`/members/${member.id}`);
      revalidatePath(`/groups/${member.groupId}`);
      revalidatePath("/");
      return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update contribution" };
  }
}

export async function deleteContribution(id: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true }
      });
      if (!contribution) throw new Error("Contribution not found");

      for (const payment of contribution.payments) {
        await tx.contributionPayment.delete({ where: { id: payment.id } });
        await tx.ledgerTransaction.delete({ where: { id: payment.ledgerTransactionId } });
      }

      await tx.monthlyContribution.delete({ where: { id } });

      revalidatePath("/contributions");
      revalidatePath("/");
      return { success: true, error: undefined };
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete contribution" };
  }
}
