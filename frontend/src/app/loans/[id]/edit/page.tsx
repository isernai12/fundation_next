import { LoanForm } from "@/features/loans/components/loan-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getGroups } from "@/features/groups/actions"
import { Trans } from "@/components/shared/trans";

export default async function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const loan = await prisma.loan.findUnique({
    where: { id: resolvedParams.id },
    include: { documents: true, allocations: { include: { fund: true } } }
  })

  if (!loan) {
    notFound()
  }

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { status: "ACTIVE" },
    orderBy: { fullName: "asc" }
  })

  const groups = await getGroups()

  const initialData = {
    id: loan.id,
    beneficiaryId: loan.beneficiaryId || "",
    loanType: loan.loanType as "BUSINESS" | "OTHER",
    businessType: loan.businessType || "",
    purpose: loan.purpose,
    amount: loan.amount,
    notes: loan.notes || "",
    installmentType: (loan.installmentType as "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM") || undefined,
    installmentAmount: loan.installmentAmount || undefined,
    totalInstallments: loan.totalInstallments || undefined,
    firstInstallmentDate: loan.firstInstallmentDate || undefined,
    isMultiGroup: loan.allocations.length > 1,
    fundAllocations: loan.allocations.length > 0 
      ? loan.allocations.map(a => ({ groupId: a.fund.groupId || "", amount: a.amount }))
      : [{ groupId: "", amount: loan.amount }]
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight"><Trans tKey="loans.table.actions.edit" /></h1>
            <p className="text-muted-foreground">
              <Trans tKey="loans.table.actions.edit" /></p>
          </div>
          <LoanForm beneficiaries={beneficiaries} groups={groups} initialData={initialData} initialDocuments={loan.documents} />
        </div>
      </div>
    </div>
  )
}
