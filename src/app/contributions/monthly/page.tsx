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
          <Trans tKey="app.text" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="app.text" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app.text" /></h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatMonth(getNow().getMonth())} {currentYear} <Trans tKey="app.text" /></p>
        </div>
      </div>

      <ContributionsTable data={monthlyContributions} />
    </div>
  )
}
