import { LoanForm } from "@/features/loans/components/loan-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const loan = await prisma.loan.findUnique({
    where: { id: resolvedParams.id },
  })

  if (!loan) {
    notFound()
  }

  const beneficiaries = await prisma.beneficiary.findMany({
    where: { status: "ACTIVE" },
    orderBy: { fullName: "asc" }
  })

  const initialData = {
    id: loan.id,
    beneficiaryId: loan.beneficiaryId || "",
    loanType: loan.loanType as "BUSINESS" | "OTHER",
    businessType: loan.businessType || "",
    purpose: loan.purpose,
    amount: loan.amount,
    notes: loan.notes || "",
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ঋণ সংশোধন</h1>
            <p className="text-muted-foreground">
              বিদ্যমান ঋণের তথ্য পরিবর্তন করুন।
            </p>
          </div>
          <LoanForm beneficiaries={beneficiaries} initialData={initialData} />
        </div>
      </div>
    </div>
  )
}
