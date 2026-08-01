import { Trans } from "@/components/shared/trans";
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
  const enhancedTransactions = []
  for (const t of transactions) {
    const loan = loanMap.get(t.referenceId || "")
    const beneficiaryName = loan?.beneficiary?.fullName || "Unknown"

    let debit = 0
    let credit = 0

    if (t.type === "LOAN") {
      debit = t.entries.filter(e => e.isCredit).reduce((sum, e) => sum + e.amount, 0)
    } else if (t.type === "REPAYMENT") {
      credit = t.entries.filter(e => !e.isCredit).reduce((sum, e) => sum + e.amount, 0)
    }

    runningBalance += debit
    runningBalance -= credit

    enhancedTransactions.push({
      ...t,
      beneficiaryName,
      debit,
      credit,
      balance: runningBalance
    })
  }

  // Sort descending for display if viewing all, but for a specific loan ledger it's usually ascending or descending with balance. 
  // Let's reverse it so newest is on top.
  enhancedTransactions.reverse()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight"><Trans tKey="loans.ledger.pageTitle" />{specificLoan ? ` - ${specificLoan.loanNumber}` : ""}</h1>
              <p className="text-muted-foreground">
                {specificLoan ? `Ledger for ${specificLoan.beneficiary?.fullName}. Total Loan: ৳${specificLoan.amount}, Remaining: ৳${specificLoan.remainingBalance}` : <Trans tKey="loans.ledger.subtitle" />}
              </p>
            </div>
          </div>
          <LoanLedgerTable transactions={enhancedTransactions} />
        </div>
      </div>
    </div>
  )
}
