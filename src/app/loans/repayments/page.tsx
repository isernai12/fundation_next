
import { prisma } from "@/lib/prisma"
import { RepaymentsTable } from "@/features/loans/components/repayments-table"

export default async function LoanRepaymentsPage() {
  const repayments = await prisma.loanRepayment.findMany({
    orderBy: { date: 'desc' },
    include: {
      loan: {
        include: { beneficiary: true, repayments: true }
      },
      ledgerTransaction: true
    }
  })

  // get active loans for new repayment
  const activeLoans = await prisma.loan.findMany({
    where: { status: { in: ["ACTIVE", "DEFAULTED"] } },
    include: { beneficiary: true, repayments: true }
  })

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Loan Repayments</h1>
              <p className="text-muted-foreground">
                View repayment history and record new payments.
              </p>
            </div>
          </div>
          <RepaymentsTable repayments={repayments} activeLoans={activeLoans} />
        </div>
      </div>
    </div>
  )
}
