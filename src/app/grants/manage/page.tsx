import { getGrants } from "@/features/grants/actions"
import { GrantsTable } from "@/features/grants/components/grants-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function ManageGrantsPage() {
  const grants = await getGrants()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          Grants
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Manage Grants</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Grants</h1>
          <p className="text-muted-foreground mt-1">
            Edit, print, archive, or delete existing grant records.
          </p>
        </div>
      </div>

      <GrantsTable data={grants as unknown as React.ComponentProps<typeof GrantsTable>['data']} manageMode={true} />
    </div>
  )
}
