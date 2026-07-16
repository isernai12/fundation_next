import { getTransactions } from "@/features/ledger/actions"
import { TransactionRegisterTable } from "@/features/ledger/components/transaction-register-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function TransactionRegisterPage() {
  const transactions = await getTransactions()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/ledger" className="hover:text-primary transition-colors">
          Ledger
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Transaction Register</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Register</h1>
          <p className="text-muted-foreground mt-1">
            Browse and filter all compiled Ledger Transactions.
          </p>
        </div>
      </div>

      <TransactionRegisterTable data={transactions as unknown as React.ComponentProps<typeof TransactionRegisterTable>['data']} />
    </div>
  )
}
