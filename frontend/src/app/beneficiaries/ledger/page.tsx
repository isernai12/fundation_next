import { BeneficiarySelector } from "@/features/beneficiaries/components/beneficiary-selector"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans"

export default async function BeneficiaryLedgerPage({ searchParams }: { searchParams: Promise<{ beneficiaryId?: string }> }) {
  const resolvedParams = await searchParams
  const beneficiaryId = resolvedParams.beneficiaryId

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/beneficiaries" className="hover:text-primary transition-colors">
          <Trans tKey="beneficiaries.breadcrumbs.index" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="beneficiaries.breadcrumbs.ledger" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="beneficiaries.ledger_page.title" /></h1>
          <p className="text-muted-foreground"><Trans tKey="beneficiaries.ledger_page.subtitle" /></p>
        </div>
        <BeneficiarySelector />
      </div>

      {!beneficiaryId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold"><Trans tKey="beneficiaries.ledger_page.no_beneficiary_title" /></div>
            <p className="text-muted-foreground"><Trans tKey="beneficiaries.ledger_page.no_beneficiary_desc" /></p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold"><Trans tKey="beneficiaries.ledger_page.not_integrated_title" /></div>
            <p className="text-muted-foreground"><Trans tKey="beneficiaries.ledger_page.not_integrated_desc" /></p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
