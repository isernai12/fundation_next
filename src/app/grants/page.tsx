import { getGrants } from "@/features/grants/actions"
import { GrantsTable } from "@/features/grants/components/grants-table"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AllGrantsPage() {
  const grants = await getGrants()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          Grants
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">All Grants</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Grants</h1>
          <p className="text-muted-foreground mt-1">
            History of all financial and material assistance grants.
          </p>
        </div>
        <Button asChild>
          <Link href="/grants/new">
            <Plus className="mr-2 h-4 w-4" /> New Grant
          </Link>
        </Button>
      </div>

      <GrantsTable data={grants as unknown as React.ComponentProps<typeof GrantsTable>['data']} />
    </div>
  )
}
