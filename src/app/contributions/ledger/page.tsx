import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default function ContributionLedgerPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          <Trans tKey="contributions.ledger.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="contributions.ledger.breadcrumb.ledger" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="contributions.ledger.pageTitle" /></h1>
          <p className="text-muted-foreground"><Trans tKey="contributions.ledger.subtitle" /></p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold"><Trans tKey="contributions.ledger.comingSoon" /></div>
          <p className="text-muted-foreground"><Trans tKey="contributions.ledger.comingSoonDesc" /></p>
        </CardContent>
      </Card>
    </div>
  )
}
