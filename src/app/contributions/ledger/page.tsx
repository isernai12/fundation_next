import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function ContributionLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          Contributions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Contribution Ledger</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contribution Ledger</h1>
          <p className="text-muted-foreground">Financial ledger entries and balances for contributions.</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold">Ledger Module Not Integrated</div>
          <p className="text-muted-foreground">The ledger module is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  )
}
