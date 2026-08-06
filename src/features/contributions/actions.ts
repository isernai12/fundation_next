"use server"

import { prisma } from "@/lib/prisma"
import { contributionSchema, type ContributionFormValues } from "./schema"
import { LedgerEngine } from "@/services/ledger"
import { revalidatePath } from "next/cache"
import { requirePermission, checkPermission } from "@/lib/rbac";

async function updateMemberPaidUntil(memberId: string, tx: any) {
  const allPaid = await tx.monthlyContribution.findMany({
     where: { memberId: memberId, status: "PAID", isAdditional: false },
     select: { month: true, year: true }
  });
  
  if (allPaid.length > 0) {
     allPaid.sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
     });
     
     let cur = allPaid[0];
     let maxContiguous = cur;
     
     for (let i = 1; i < allPaid.length; i++) {
       const next = allPaid[i];
       if ((next.year === cur.year && next.month === cur.month + 1) || 
           (next.year === cur.year + 1 && next.month === 1 && cur.month === 12)) {
         cur = next;
         maxContiguous = next;
       } else if (next.year === cur.year && next.month === cur.month) {
         // Same month, skip
         continue;
       } else {
         break;
       }
     }

     await tx.member.update({
       where: { id: memberId },
       data: {
         paidUntilMonth: maxContiguous.month,
         paidUntilYear: maxContiguous.year
       }
     });
  } else {
     await tx.member.update({
       where: { id: memberId },
       data: {
         paidUntilMonth: null,
         paidUntilYear: null
       }
     });
  }
}

export async function createContribution(data: ContributionFormValues) {
    await requirePermission("Fund Collection", "Add");
  const parsed = contributionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" }
  
  const pd = parsed.data

  try {
    const result = await prisma.$transaction(async (tx) => {
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

      await updateMemberPaidUntil(pd.memberId, tx)

      return { success: true, memberGroupId: member.groupId, error: undefined }
    })

    if (result.success) {
      revalidatePath("/contributions")
      revalidatePath(`/members/${pd.memberId}`)
      if (result.memberGroupId) revalidatePath(`/groups/${result.memberGroupId}`)
      revalidatePath("/")
    }

    return result
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "মাসিক চাঁদা প্রক্রিয়া করতে ব্যর্থ হয়েছে" }
  }
}

export async function getContributions() {
  if (!await checkPermission("Fund Collection", "View")) return [];
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
    const result = await prisma.$transaction(async (tx) => {
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

      await updateMemberPaidUntil(pd.memberId, tx)

      return { success: true, memberGroupId: member.groupId, error: undefined };
    });

    if (result.success) {
      revalidatePath("/contributions");
      revalidatePath(`/members/${pd.memberId}`);
      if (result.memberGroupId) revalidatePath(`/groups/${result.memberGroupId}`);
      revalidatePath("/");
    }

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "চাঁদা আপডেট করতে ব্যর্থ হয়েছে" };
  }
}

export async function deleteContribution(id: string) {
    await requirePermission("Fund Collection", "Delete");
  try {
    let memberId: string | null = null;
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true }
      });
      if (!contribution) throw new Error("চাঁদার তথ্য খুঁজে পাওয়া যায়নি");

      memberId = contribution.memberId;

      for (const payment of contribution.payments) {
        await tx.contributionPayment.delete({ where: { id: payment.id } });
        await tx.ledgerTransaction.delete({ where: { id: payment.ledgerTransactionId } });
      }

      await tx.monthlyContribution.delete({ where: { id } });
      
      await updateMemberPaidUntil(contribution.memberId, tx);

      return { success: true, error: undefined };
    });

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/contributions");
      if (memberId) revalidatePath(`/members/${memberId}`);
    }

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "চাঁদা মুছে ফেলতে ব্যর্থ হয়েছে" };
  }
}

import { bulkContributionSchema, type BulkContributionFormValues } from "./schema"

export async function createBulkContribution(data: BulkContributionFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = bulkContributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };
  const pd = parsed.data;

  if (pd.fromYear > pd.toYear || (pd.fromYear === pd.toYear && pd.fromMonth > pd.toMonth)) {
     return { success: false, error: "শুরুর মাস শেষের মাসের চেয়ে বড় হতে পারে না" };
  }

  // Generate all month-year pairs in range outside transaction
  const targetMonths: { month: number, year: number }[] = [];
  let curMonth = pd.fromMonth;
  let curYear = pd.fromYear;
  const endMonth = pd.toMonth;
  const endYear = pd.toYear;

  while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
    targetMonths.push({ month: curMonth, year: curYear });
    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: pd.memberId } });
      if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি");

      // Find existing
      const existing = await tx.monthlyContribution.findMany({
        where: {
          memberId: pd.memberId,
          isAdditional: false,
          OR: targetMonths.map(m => ({ month: m.month, year: m.year }))
        }
      });

      const paidSet = new Set(existing.filter(e => e.status === "PAID").map(e => `${e.month}-${e.year}`));
      const pendingMap = new Map(existing.filter(e => e.status !== "PAID").map(e => [`${e.month}-${e.year}`, e]));

      let processedCount = 0;
      
      const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx);

      for (const m of targetMonths) {
        const key = `${m.month}-${m.year}`;
        if (paidSet.has(key)) continue; // Skip already paid

        let monthlyContributionId = pendingMap.get(key)?.id;

        if (monthlyContributionId) {
          await tx.monthlyContribution.update({
            where: { id: monthlyContributionId },
            data: { status: "PAID", expectedAmount: pd.monthlyAmount }
          });
        } else {
          const newMc = await tx.monthlyContribution.create({
            data: {
              memberId: pd.memberId,
              month: m.month,
              year: m.year,
              expectedAmount: pd.monthlyAmount,
              isAdditional: false,
              status: "PAID",
            }
          });
          monthlyContributionId = newMc.id;
        }

        const refNumber = pd.referenceNumber ? `${pd.referenceNumber}-${m.month}-${m.year}` : undefined;

        const ledgerTx = await LedgerEngine.createTransaction({
          date: new Date(pd.paymentDate),
          type: "CONTRIBUTION",
          referenceId: refNumber,
          notes: pd.notes,
          entries: [
            { fundId: generalFund.id, isCredit: false, amount: pd.monthlyAmount },
            { fundId: groupFund.id, isCredit: true, amount: pd.monthlyAmount }
          ]
        }, tx);

        await tx.contributionPayment.create({
          data: {
            monthlyContributionId: monthlyContributionId,
            ledgerTransactionId: ledgerTx.id,
            amount: pd.monthlyAmount,
            paymentDate: new Date(pd.paymentDate),
            paymentMethod: pd.paymentMethod,
            referenceNumber: refNumber,
            notes: pd.notes,
          }
        });
        
        processedCount++;
      }

      if (processedCount === 0) {
         throw new Error("নির্বাচিত সমস্ত মাস ইতিমধ্যেই পরিশোধিত।");
      }

      await updateMemberPaidUntil(pd.memberId, tx);

      return { success: true, count: processedCount, memberGroupId: member.groupId, error: undefined };
    }, { timeout: 15000 });

    if (result.success) {
      revalidatePath("/contributions");
      revalidatePath(`/members/${pd.memberId}`);
      if (result.memberGroupId) revalidatePath(`/groups/${result.memberGroupId}`);
      revalidatePath("/");
    }

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "একাধিক মাসের চাঁদা প্রক্রিয়া করতে ব্যর্থ হয়েছে" };
  }
}

export async function getMemberPaidMonths(memberId: string) {
  if (!memberId) return [];
  const paid = await prisma.monthlyContribution.findMany({
    where: { memberId, status: "PAID", isAdditional: false },
    select: { month: true, year: true }
  });
  return paid.map(p => `${p.month}-${p.year}`);
}
