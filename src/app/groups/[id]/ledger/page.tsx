import { getGroupLedger, getGroup } from "@/features/groups/actions"
import { GroupLedgerTable } from "@/features/groups/components/group-ledger-table"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function GroupLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const groupId = resolvedParams.id
  
  const group = await getGroup(groupId)
  if (!group) return notFound()

  const ledgerEntries = await getGroupLedger(groupId)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/groups/${group.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Ledger: {group.name}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground mt-1">
            <span>Code: {group.code}</span>
            <span>&bull;</span>
            <Badge variant={group.status === "ACTIVE" ? "default" : "secondary"}>
              {group.status}
            </Badge>
          </div>
        </div>
      </div>

      <GroupLedgerTable data={ledgerEntries} />
    </div>
  )
}
