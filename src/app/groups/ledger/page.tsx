import { getGroupLedger, getGroup } from "@/features/groups/actions"
import { GroupLedgerTable } from "@/features/groups/components/group-ledger-table"
import { GroupSelector } from "@/features/groups/components/group-selector"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans"
import Link from "next/link"

export default async function GroupLedgerPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const resolvedParams = await searchParams
  const groupId = resolvedParams.groupId
  const ledgerEntries = groupId ? await getGroupLedger(groupId) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/groups" className="hover:text-primary transition-colors">
          <Trans tKey="groups.manage.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="groups.ledger.pageTitle" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="groups.ledger.pageTitle" /></h1>
          <p className="text-muted-foreground mt-1"><Trans tKey="groups.ledger.subtitle" /></p>
        </div>
        <GroupSelector />
      </div>

      {!groupId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold"><Trans tKey="groups.ledger.emptyTitle" /></div>
            <p className="text-muted-foreground"><Trans tKey="groups.ledger.emptySubtitle" /></p>
          </CardContent>
        </Card>
      ) : (
        <GroupLedgerTable data={ledgerEntries} />
      )}
    </div>
  )
}
