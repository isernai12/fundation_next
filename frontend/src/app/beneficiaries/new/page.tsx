import { getMembers } from "@/features/members/actions"
import { BeneficiaryForm } from "@/features/beneficiaries/components/beneficiary-form"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans"

import { enDictionaries } from "@/i18n/dictionaries"
import legacyEn from "@/i18n/locales/en.json"

export default async function NewBeneficiaryPage() {
  const members = await getMembers()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/beneficiaries" className="hover:text-primary transition-colors">
          <Trans tKey="beneficiaries.breadcrumbs.index" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="beneficiaries.breadcrumbs.add" /></span>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="beneficiaries.add_page.title" /></h1>
        <p className="text-muted-foreground"><Trans tKey="beneficiaries.add_page.subtitle" /></p>
      </div>

      <BeneficiaryForm members={members} />
    </div>
  )
}
