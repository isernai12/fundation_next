"use server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac";

export async function getMemberLedger(memberId: string) {
    await requirePermission("Reports", "View");
  // Fetch member info
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      group: true,
      beneficiaries: true,
    }
  });

  if (!member) throw new Error("Member not found");

  const rows: any[] = [];

  // 1. Contributions (Deposit)
  const contributions = await prisma.contributionPayment.findMany({
    where: { monthlyContribution: { memberId } },
    include: { ledgerTransaction: true, monthlyContribution: true }
  });
  
  for (const c of contributions) {
    if (c.ledgerTransaction) {
      rows.push({
        id: c.ledgerTransaction.id,
        date: c.ledgerTransaction.date,
        reference: c.ledgerTransaction.referenceId || c.referenceNumber || "-",
        description: `মাসিক চাঁদা - ${c.monthlyContribution.month}/${c.monthlyContribution.year}`,
        deposit: c.amount,
        withdrawal: 0,
        type: "CONTRIBUTION"
      });
    }
  }

  // 2. Loan Repayments (Deposit)
  const loanRepayments = await prisma.loanRepayment.findMany({
    where: { loan: { memberId } },
    include: { ledgerTransaction: true, loan: true }
  });

  for (const r of loanRepayments) {
    if (r.ledgerTransaction) {
      rows.push({
        id: r.ledgerTransaction.id,
        date: r.ledgerTransaction.date,
        reference: r.ledgerTransaction.referenceId || "-",
        description: `ঋণ পরিশোধ - ${r.loan.loanNumber}`,
        deposit: r.amount,
        withdrawal: 0,
        type: "LOAN_REPAYMENT"
      });
    }
  }

  // 3. Loan Disbursements (Withdrawal)
  const loans = await prisma.loan.findMany({
    where: { memberId, status: { in: ["ACTIVE", "COMPLETED", "DEFAULTED"] } }
  });
  
  const loanNumbers = loans.map(l => l.loanNumber);
  
  if (loanNumbers.length > 0) {
    const loanTxs = await prisma.ledgerTransaction.findMany({
      where: { type: "LOAN", referenceId: { in: loanNumbers } }
    });
    
    for (const tx of loanTxs) {
      rows.push({
        id: tx.id,
        date: tx.date,
        reference: tx.referenceId || "-",
        description: `ঋণ বিতরণ - ${tx.referenceId}`,
        deposit: 0,
        withdrawal: (await prisma.ledgerEntry.findFirst({ where: { transactionId: tx.id, isCredit: false } }))?.amount || loans.find(l => l.loanNumber === tx.referenceId)?.amount || 0,
        type: "LOAN"
      });
    }
  }

  // 4. Grants (Withdrawal)
  const beneficiaryIds = member.beneficiaries.map(b => b.id);
  if (beneficiaryIds.length > 0) {
    const grants = await prisma.grant.findMany({
      where: { beneficiaryId: { in: beneficiaryIds } }
    });
    
    // For grants, we might not have a reliable referenceId if they didn't use grantNumber, 
    // but going forward we will use grantNumber. For now, match by date and amount if needed, 
    // but to be safe we just assume the ledger is correct if referenceId matches grantNumber or referenceNumber.
    const grantNumbers = grants.map(g => g.grantNumber);
    if (grantNumbers.length > 0) {
      const grantTxs = await prisma.ledgerTransaction.findMany({
        where: { type: "GRANT", referenceId: { in: grantNumbers } }
      });
      
      for (const tx of grantTxs) {
        rows.push({
          id: tx.id,
          date: tx.date,
          reference: tx.referenceId || "-",
          description: `অনুদান - ${tx.referenceId}`,
          deposit: 0,
          withdrawal: grants.find(g => g.grantNumber === tx.referenceId)?.amount || 0,
          type: "GRANT"
        });
      }
    }
  }

  // Sort chronologically (oldest first)
  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balance
  let currentBalance = 0;
  const ledgerData = rows.map(r => {
    currentBalance += r.deposit;
    currentBalance -= r.withdrawal;
    return {
      ...r,
      balance: currentBalance
    };
  });

  return {
    member: {
      id: member.id,
      memberId: member.memberId,
      fullName: member.fullName,
      groupName: member.group?.name || "-",
      groupCode: member.group?.code || "-",
      joinDate: member.createdAt,
      status: member.status
    },
    ledger: ledgerData
  };
}
