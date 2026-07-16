import { ContributionForm } from "@/features/contributions/components/contribution-form"
import { getMembers } from "@/features/members/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function AddContributionPage() {
  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          Contributions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Add Contribution</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Contribution</h1>
          <p className="text-muted-foreground">Record a new contribution for a member.</p>
        </div>
      </div>

      <ContributionForm members={members} />
    </div>
  )
}
