import { getGrants } from "@/features/grants/actions"
import { GrantsTable } from "@/features/grants/components/grants-table"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Trans } from "@/components/shared/trans";

export default async function ManageGrantsPage() {
  const grants = await getGrants()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          <Trans tKey="app.text" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="app.text" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app.text" /></h1>
          <p className="text-muted-foreground mt-1">
            <Trans tKey="app.text" /></p>
        </div>
        <Button asChild>
          <Link href="/grants/new">
            <Plus className="mr-2 h-4 w-4" /> <Trans tKey="app.text" /></Link>
        </Button>
      </div>

      <GrantsTable data={grants as unknown as React.ComponentProps<typeof GrantsTable>['data']} manageMode={true} />
    </div>
  )
}
