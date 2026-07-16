import { getContributions } from "@/features/contributions/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ContributionsTable } from "@/features/contributions/components/contributions-table"

export default async function ContributionsPage() {
  const contributions = await getContributions()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          Contributions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">All Contributions</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete history of all member contributions.
          </p>
        </div>
      </div>

      <ContributionsTable data={contributions} />
    </div>
  )
}
