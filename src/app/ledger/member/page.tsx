import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function MemberLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/ledger" className="hover:text-primary transition-colors">
          Ledger
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Member Ledger</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Ledger</h1>
          <p className="text-muted-foreground mt-1">Financial overview and transactions for specific members.</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold">Member Ledger Interface</div>
          <p className="text-muted-foreground max-w-md text-center">
            To view a Member&apos;s ledger, navigate to the Members module and select &quot;Member Ledger&quot; from a specific member&apos;s management page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
