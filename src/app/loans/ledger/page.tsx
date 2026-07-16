
import { prisma } from "@/lib/prisma"
import { LoanLedgerTable } from "@/features/loans/components/loan-ledger-table"

export default async function LoanLedgerPage() {
  const transactions = await prisma.ledgerTransaction.findMany({
    where: {
      type: { in: ["LOAN", "REPAYMENT"] }
    },
    orderBy: { date: 'desc' },
    include: {
      entries: {
        include: { fund: { include: { group: true } } }
      }
    }
  })

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Loan Ledger</h1>
              <p className="text-muted-foreground">
                View all loan disbursement and repayment ledger transactions.
              </p>
            </div>
          </div>
          <LoanLedgerTable transactions={transactions} />
        </div>
      </div>
    </div>
  )
}
