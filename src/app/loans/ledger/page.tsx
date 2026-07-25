import { prisma } from "@/lib/prisma"
import { LoanLedgerTable } from "@/features/loans/components/loan-ledger-table"

export default async function LoanLedgerPage({ searchParams }: { searchParams: { loanId?: string } }) {
  const { loanId } = searchParams

  let loanNumberFilter: string | undefined = undefined
  let specificLoan = null

  if (loanId) {
    specificLoan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { beneficiary: true }
    })
    if (specificLoan) {
      loanNumberFilter = specificLoan.loanNumber
    }
  }

  const transactions = await prisma.ledgerTransaction.findMany({
    where: {
      type: { in: ["LOAN", "REPAYMENT"] },
      ...(loanNumberFilter ? { referenceId: loanNumberFilter } : {})
    },
    orderBy: { date: 'asc' }, // Ascending to calculate running balance
    include: {
      entries: {
        include: { fund: { include: { group: true } } }
      }
    }
  })

  // Fetch all loans to map beneficiaries if we are viewing all loans
  const loans = await prisma.loan.findMany({ include: { beneficiary: true } })
  const loanMap = new Map(loans.map(l => [l.loanNumber, l]))

  let runningBalance = 0
  const enhancedTransactions = transactions.map(t => {
    const loan = loanMap.get(t.referenceId || "")
    const beneficiaryName = loan?.beneficiary?.fullName || "Unknown"

    // Calculate Debit / Credit for the loan
    // In LOAN (disbursement), the principal increases (Debit to borrower)
    // In REPAYMENT, the principal decreases (Credit from borrower)
    
    let debit = 0
    let credit = 0

    if (t.type === "LOAN") {
      // Find the credit entry to the general fund, but simpler: use the total amount disbursed.
      // Wait, let's just look at the entries. General fund is credited? No, General Fund Cash is credited, Loan Asset is debited.
      // But in Fund Accounting, they didn't create a Loan Asset fund explicitly, they use allocations.
      // Let's just use the amount from the General Fund entry or sum.
      // Actually, if it's LOAN, it's a disbursement. The user owes us. Debit = amount.
      // If we just want the total transaction amount, we can sum the debits or credits divided by 2, or just find the general fund amount.
      // A simpler way: since we don't have the explicit amount on LedgerTransaction, we can get it from entries where isCredit=true
      debit = t.entries.filter(e => !e.isCredit).reduce((sum, e) => sum + e.amount, 0)
      // Wait, in `createLoanRequest` (actions.ts:91), General Fund is Credited (isCredit=true), Group Funds are Debited.
      // So the total amount is the General Fund credit amount.
      debit = t.entries.filter(e => e.isCredit).reduce((sum, e) => sum + e.amount, 0)
    } else if (t.type === "REPAYMENT") {
      // In `repayLoan` (actions.ts:184), General Fund is Debited (isCredit=false), Group Funds are Credited (isCredit=true)
      // So the repayment amount is the General Fund debit amount.
      credit = t.entries.filter(e => !e.isCredit).reduce((sum, e) => sum + e.amount, 0)
    }

    runningBalance += debit
    runningBalance -= credit

    return {
      ...t,
      beneficiaryName,
      debit,
      credit,
      balance: runningBalance
    }
  })

  // Sort descending for display if viewing all, but for a specific loan ledger it's usually ascending or descending with balance. 
  // Let's reverse it so newest is on top.
  enhancedTransactions.reverse()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Loan Ledger {specificLoan ? `- ${specificLoan.loanNumber}` : ""}</h1>
              <p className="text-muted-foreground">
                {specificLoan 
                  ? `Ledger for ${specificLoan.beneficiary?.fullName}. Total Loan: ৳${specificLoan.amount}, Remaining: ৳${specificLoan.remainingBalance}`
                  : "View all loan disbursement and repayment ledger transactions."}
              </p>
            </div>
          </div>
          <LoanLedgerTable transactions={enhancedTransactions} />
        </div>
      </div>
    </div>
  )
}
