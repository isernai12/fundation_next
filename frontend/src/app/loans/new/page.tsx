import { LoanForm } from "@/features/loans/components/loan-form"
import { prisma } from "@/lib/prisma"
import { getGroups } from "@/features/groups/actions"
import { Trans } from "@/components/shared/trans";

export default async function NewLoanPage() {
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { status: "ACTIVE" },
    orderBy: { fullName: "asc" }
  })

  const groups = await getGroups()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight"><Trans tKey="loans.new.subtitle" /></h1>
            <p className="text-muted-foreground">
              <Trans tKey="loans.new.subtitle" /></p>
          </div>
          <LoanForm beneficiaries={beneficiaries} groups={groups} />
        </div>
      </div>
    </div>
  )
}
