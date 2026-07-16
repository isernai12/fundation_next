import { getGeneralLedgerEntries } from "@/features/ledger/actions"
import { GeneralLedgerTable } from "@/features/ledger/components/general-ledger-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function GeneralLedgerPage() {
  const entries = await getGeneralLedgerEntries()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/ledger" className="hover:text-primary transition-colors">
          Ledger
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">General Ledger</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Complete history of all double-entry financial transactions.
          </p>
        </div>
      </div>

      <GeneralLedgerTable data={entries as unknown as React.ComponentProps<typeof GeneralLedgerTable>['data']} />
    </div>
  )
}
