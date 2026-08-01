import { getNow } from "@/lib/date";
import { formatMonth } from "@/lib/format"
import { getContributions } from "@/features/contributions/actions"
import { ContributionsTable } from "@/features/contributions/components/contributions-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default async function MonthlyContributionsPage() {
  // Ideally this would filter by month, but for now we get all and let the table handle it, or we filter here.
  const allContributions = await getContributions()
  
  const currentMonth = getNow().getMonth() + 1
  const currentYear = getNow().getFullYear()
  
  const monthlyContributions = allContributions.filter(c => c.month === currentMonth && c.year === currentYear)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          <Trans tKey="contributions.monthly.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="contributions.monthly.breadcrumb.monthly" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="contributions.monthly.pageTitle" /></h1>
          <p className="text-muted-foreground mt-1">
            <Trans tKey="contributions.monthly.subtitle" /> {formatMonth(getNow().getMonth())} {currentYear}
          </p>
        </div>
      </div>

      <ContributionsTable data={monthlyContributions} />
    </div>
  )
}
