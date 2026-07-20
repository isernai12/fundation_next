import { getGroupLedger } from "@/features/groups/actions"
import { GroupSelector } from "@/features/groups/components/group-selector"
import { GroupLedgerTable } from "@/features/groups/components/group-ledger-table"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default async function GroupLedgerPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const resolvedParams = await searchParams
  const groupId = resolvedParams.groupId
  const ledgerEntries = groupId ? await getGroupLedger(groupId) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Ledger</h1>
          <p className="text-muted-foreground">View the detailed financial ledger for the selected group.</p>
        </div>
        <GroupSelector />
      </div>

      {!groupId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold">No Group Selected</div>
            <p className="text-muted-foreground">Please select a group from the dropdown above to view its ledger.</p>
          </CardContent>
        </Card>
      ) : (
        <GroupLedgerTable data={ledgerEntries} />
      )}
    </div>
  )
}
