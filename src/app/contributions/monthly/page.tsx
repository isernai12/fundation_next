import { getNow } from "@/lib/date";
import { formatMonth } from "@/lib/format"
import { getContributions } from "@/features/contributions/actions"
import { getMembers } from "@/features/members/actions"
import { MonthlyMatrixTable } from "@/features/contributions/components/monthly-matrix-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default async function MonthlyContributionsPage() {
  const currentYear = getNow().getFullYear()
  const currentMonth = getNow().getMonth() + 1
  
  const allMembers = await getMembers()
  const activeMembers = allMembers.filter(m => m.status === "ACTIVE")
  
  const allContributions = await getContributions()
  const yearlyContributions = allContributions.filter(c => c.year === currentYear)

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
            <Trans tKey="contributions.monthly.subtitle" /> {currentYear}
          </p>
        </div>
      </div>

      <MonthlyMatrixTable 
        members={activeMembers} 
        contributions={yearlyContributions} 
        currentMonth={currentMonth} 
      />
    </div>
  )
}
