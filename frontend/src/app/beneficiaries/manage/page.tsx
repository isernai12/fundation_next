import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beneficiary Management",
};

import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { getMembers } from "@/features/members/actions"
import { BeneficiariesTable } from "@/features/beneficiaries/components/beneficiaries-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans"

export default async function ManageBeneficiariesPage() {
  const beneficiaries = await getBeneficiaries()
  const members = await getMembers()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/beneficiaries" className="hover:text-primary transition-colors">
          <Trans tKey="beneficiaries.breadcrumbs.index" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="beneficiaries.breadcrumbs.manage" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="beneficiaries.manage_page.title" /></h1>
          <p className="text-muted-foreground text-sm mt-1">
            <Trans tKey="beneficiaries.manage_page.subtitle" />
          </p>
        </div>
      </div>

      <BeneficiariesTable data={beneficiaries} members={members} manageMode={true} />
    </div>
  )
}
