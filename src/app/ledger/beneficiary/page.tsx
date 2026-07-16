import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function BeneficiaryLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/ledger" className="hover:text-primary transition-colors">
          Ledger
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Beneficiary Ledger</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Ledger</h1>
          <p className="text-muted-foreground mt-1">Financial overview and transactions for specific beneficiaries.</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold">Beneficiary Ledger Interface</div>
          <p className="text-muted-foreground max-w-md text-center">
            To view a Beneficiary&apos;s ledger, navigate to the Beneficiary module and select &quot;Beneficiary Ledger&quot; from their management page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
