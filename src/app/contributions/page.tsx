import { getContributions } from "@/features/contributions/actions"
import { getMembers } from "@/features/members/actions"
import { ContributionsTable } from "@/features/contributions/components/contributions-table"
import { ContributionFormDialog } from "@/features/contributions/components/contribution-form-dialog"

export default async function ContributionsPage() {
  const contributions = await getContributions()
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage member monthly contributions and payments.
          </p>
        </div>
        <ContributionFormDialog members={members} />
      </div>

      <ContributionsTable data={contributions} />
    </div>
  )
}
