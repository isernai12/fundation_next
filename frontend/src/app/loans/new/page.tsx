import { LoanForm } from "@/features/loans/components/loan-form"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { getGroups } from "@/features/groups/actions"
import { Trans } from "@/components/shared/trans";

export const dynamic = "force-dynamic";

export default async function NewLoanPage() {
  const rawBeneficiaries = await getBeneficiaries()
  const beneficiaries = rawBeneficiaries.map(b => ({
    id: b.id,
    beneficiaryId: b.beneficiaryId,
    fullName: b.name,
    mobile: b.mobile,
    address: b.address,
    category: b.category,
    status: b.status,
    memberId: b.memberId,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    fatherOrHusbandName: b.fatherOrHusbandName,
    motherName: b.motherName,
    nationalId: b.nationalId,
    occupation: b.occupation,
    monthlyIncome: b.monthlyIncome,
    beneficiaryPhoto: null,
    nidOrBirthCertificate: null,
  }))

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
          <LoanForm beneficiaries={beneficiaries as any} groups={groups} />
        </div>
      </div>
    </div>
  )
}
