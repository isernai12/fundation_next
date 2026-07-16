import { notFound } from "next/navigation"
import { getLoan } from "@/features/loans/actions"

import { ManageLoanView } from "@/features/loans/components/manage-loan-view"

export default async function ManageLoanPage({ params }: { params: { id: string } }) {
  const loan = await getLoan(params.id)
  if (!loan) return notFound()

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Loan: {loan.loanNumber}</h1>
            <p className="text-muted-foreground">
              View, edit, print, archive, or delete this loan.
            </p>
          </div>
          <ManageLoanView loan={loan} />
        </div>
      </div>
    </div>
  )
}
