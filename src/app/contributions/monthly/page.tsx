import { formatMonth } from "@/lib/format"
import { getContributions } from "@/features/contributions/actions"
import { ContributionsTable } from "@/features/contributions/components/contributions-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function MonthlyContributionsPage() {
  // Ideally this would filter by month, but for now we get all and let the table handle it, or we filter here.
  const allContributions = await getContributions()
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  
  const monthlyContributions = allContributions.filter(c => c.month === currentMonth && c.year === currentYear)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          Contributions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Monthly Contributions</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Displaying contributions for {formatMonth(new Date().getUTCMonth())} {currentYear}.
          </p>
        </div>
      </div>

      <ContributionsTable data={monthlyContributions} />
    </div>
  )
}
