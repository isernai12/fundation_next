import { getContributions } from "@/features/contributions/actions"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { ContributionsTable } from "@/features/contributions/components/contributions-table"
import { Button } from "@/components/ui/button"
import { Trans } from "@/components/shared/trans";

export default async function ContributionsPage() {
  const contributions = await getContributions()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          <Trans tKey="contributions.manage.breadcrumb.home" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="contributions.manage.breadcrumb.manage" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="contributions.manage.pageTitle" /></h1>
          <p className="text-muted-foreground"><Trans tKey="contributions.manage.subtitle" /></p>
        </div>
        <Link href="/contributions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> <Trans tKey="contributions.manage.newContribution" /></Button>
        </Link>
      </div>

      <ContributionsTable data={contributions} />
    </div>
  )
}
