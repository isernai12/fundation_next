import { getGrants } from "@/features/grants/actions"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { GrantsTable } from "@/features/grants/components/grants-table"
import { GrantFormDialog } from "@/features/grants/components/grant-form-dialog"

export default async function GrantsPage() {
  const grants = await getGrants()
  const beneficiaries = await getBeneficiaries()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grants</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage foundation grants and donations.
          </p>
        </div>
        <GrantFormDialog beneficiaries={beneficiaries} />
      </div>

      <GrantsTable data={grants} />
    </div>
  )
}
