import { getGrants } from "@/features/grants/actions"
import { GrantsTable } from "@/features/grants/components/grants-table"
import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ManageGrantsPage() {
  const grants = await getGrants()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          অনুদান
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">অনুদান পরিচালনা</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">অনুদান পরিচালনা</h1>
          <p className="text-muted-foreground mt-1">
            বিদ্যমান অনুদান রেকর্ড সম্পাদনা, প্রিন্ট, আর্কাইভ বা মুছুন।
          </p>
        </div>
        <Button asChild>
          <Link href="/grants/new">
            <Plus className="mr-2 h-4 w-4" /> নতুন অনুদান
          </Link>
        </Button>
      </div>

      <GrantsTable data={grants as unknown as React.ComponentProps<typeof GrantsTable>['data']} manageMode={true} />
    </div>
  )
}
