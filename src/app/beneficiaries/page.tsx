import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { getMembers } from "@/features/members/actions"
import { BeneficiariesTable } from "@/features/beneficiaries/components/beneficiaries-table"
import { BeneficiaryFormDialog } from "@/features/beneficiaries/components/beneficiary-form-dialog"

export default async function BeneficiariesPage() {
  const beneficiaries = await getBeneficiaries()
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiaries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage foundation beneficiaries for loans and grants.
          </p>
        </div>
        <BeneficiaryFormDialog members={members} />
      </div>

      <BeneficiariesTable data={beneficiaries} members={members} />
    </div>
  )
}
