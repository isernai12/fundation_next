import { getFundAllocations } from "@/features/ledger/actions"
import { FundAllocationsTable } from "@/features/ledger/components/fund-allocations-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function FundAllocationsPage() {
  const allocations = await getFundAllocations()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/ledger" className="hover:text-primary transition-colors">
          Ledger
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Fund Allocations</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fund Allocation Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Track precise allocations when loans or grants utilize funds from multiple groups.
          </p>
        </div>
      </div>

      <FundAllocationsTable data={allocations as unknown as React.ComponentProps<typeof FundAllocationsTable>['data']} />
    </div>
  )
}
