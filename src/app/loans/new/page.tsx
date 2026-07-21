import { LoanForm } from "@/features/loans/components/loan-form"
import { prisma } from "@/lib/prisma"

export default async function NewLoanPage() {
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { status: "ACTIVE" },
    orderBy: { fullName: "asc" }
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">নতুন ঋণ আবেদন</h1>
            <p className="text-muted-foreground">
              সুবিধাভোগীর জন্য নতুন ঋণের আবেদন করুন।
            </p>
          </div>
          <LoanForm beneficiaries={beneficiaries} />
        </div>
      </div>
    </div>
  )
}
