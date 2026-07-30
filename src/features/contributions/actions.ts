"use server"

import { prisma } from "@/lib/prisma"
import { contributionSchema, type ContributionFormValues } from "./schema"
import { LedgerEngine } from "@/services/ledger"
import { revalidatePath } from "next/cache"
import { requirePermission } from "@/lib/rbac";

export async function createContribution(data: ContributionFormValues) {
    await requirePermission("Fund Collection", "Add");
  const parsed = contributionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" }
  
  const pd = parsed.data

  try {
    return await prisma.$transaction(async (tx) => {
      // Handle MEMBER CONTRIBUTION
      const member = await tx.member.findUnique({ where: { id: pd.memberId } })
      if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি")

      let monthlyContribution = null;

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
            throw new Error("এই চাঁদাটি ইতিমধ্যেই সম্পূর্ণ পরিশোধিত। অতিরিক্ত চাঁদার জন্য 'অতিরিক্ত চাঁদা' ব্যবহার করুন।")
          }
          monthlyContribution = await tx.monthlyContribution.update({
            where: { id: existing.id },
            data: { status: pd.status }
          })
        }
      }

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

      if (pd.status === "PAID") {
        if (pd.referenceNumber) {
          const existingPayment = await tx.contributionPayment.findFirst({
            where: { referenceNumber: pd.referenceNumber }
          })
          if (existingPayment) throw new Error("এই রেফারেন্স নম্বর দিয়ে ইতিমধ্যে একটি পেমেন্ট রেকর্ড করা হয়েছে।")
        }

        const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx)

        const ledgerTx = await LedgerEngine.createTransaction({
          date: new Date(pd.paymentDate),
          type: "CONTRIBUTION",
          referenceId: pd.referenceNumber,
          notes: pd.notes,
          entries: [
            { fundId: generalFund.id, isCredit: false, amount: pd.amount },
            { fundId: groupFund.id, isCredit: true, amount: pd.amount }
          ]
        }, tx)

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
    return { success: false, error: error instanceof Error ? error.message : "মাসিক চাঁদা প্রক্রিয়া করতে ব্যর্থ হয়েছে" }
  }
}

export async function getContributions() {
    await requirePermission("Fund Collection", "View");
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
    await requirePermission("Fund Collection", "Edit");
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };
  const pd = parsed.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true }
      });
      if (!contribution) throw new Error("চাঁদার তথ্য খুঁজে পাওয়া যায়নি");

      const member = await tx.member.findUnique({ where: { id: pd.memberId } });
      if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি");

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
      // If payment exists, update it. If not, and status is PAID, create it.
      if (pd.status === "PAID") {
        const existingPayment = contribution.payments[0];
        
        if (existingPayment) {
          // Check if reference changed and already exists elsewhere
          if (pd.referenceNumber && pd.referenceNumber !== existingPayment.referenceNumber) {
             const refExists = await tx.contributionPayment.findFirst({ where: { referenceNumber: pd.referenceNumber, id: { not: existingPayment.id } }});
             if (refExists) throw new Error("রেফারেন্স নম্বরটি ইতিমধ্যে ব্যবহৃত হচ্ছে।");
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
    return { success: false, error: error.message || "চাঁদা আপডেট করতে ব্যর্থ হয়েছে" };
  }
}

export async function deleteContribution(id: string) {
    await requirePermission("Fund Collection", "Delete");
  try {
    return await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true }
      });
      if (!contribution) throw new Error("চাঁদার তথ্য খুঁজে পাওয়া যায়নি");

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
    return { success: false, error: error.message || "চাঁদা মুছে ফেলতে ব্যর্থ হয়েছে" };
  }
}
