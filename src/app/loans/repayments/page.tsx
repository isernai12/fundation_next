import { getLoans } from "@/features/loans/actions"
import { ReceiveLoanPaymentForm } from "@/features/loans/components/receive-loan-payment-form"
import { Trans } from "@/components/shared/trans";

export default async function ReceiveLoanPaymentPage({
  searchParams
}: {
  searchParams: Promise<{ loanId?: string }>
}) {
  const resolvedParams = await searchParams
  const allLoans = await getLoans()
  const activeLoans = allLoans.filter(l => l.status === "ACTIVE" || l.status === "DEFAULTED")
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="loans.repay.pageTitle" /></h1>
        <p className="text-muted-foreground text-sm mt-1">
          <Trans tKey="loans.repay.subtitle" />
        </p>
      </div>
      <ReceiveLoanPaymentForm loans={activeLoans} initialLoanId={resolvedParams.loanId} />
    </div>
  )
}
