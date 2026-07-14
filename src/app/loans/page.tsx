import { getLoans } from "@/features/loans/actions"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { LoansTable } from "@/features/loans/components/loans-table"
import { LoanFormDialog } from "@/features/loans/components/loan-form-dialog"

export default async function LoansPage() {
  const loans = await getLoans()
  const beneficiaries = await getBeneficiaries()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage zero-interest loans, allocations, and repayments.
          </p>
        </div>
        <LoanFormDialog beneficiaries={beneficiaries} />
      </div>

      <LoansTable data={loans} />
    </div>
  )
}
