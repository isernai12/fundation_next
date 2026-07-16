
import { prisma } from "@/lib/prisma"
import { InstallmentsTable } from "@/features/loans/components/installments-table"

export default async function LoanInstallmentsPage() {
  const installments = await prisma.loanInstallment.findMany({
    orderBy: { dueDate: 'asc' },
    include: {
      loan: {
        include: { beneficiary: true }
      },
    }
  })

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Loan Installments</h1>
              <p className="text-muted-foreground">
                View all loan installments and their schedule.
              </p>
            </div>
          </div>
          <InstallmentsTable installments={installments} />
        </div>
      </div>
    </div>
  )
}
