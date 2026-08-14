import { GrantForm } from "@/features/grants/components/grant-form"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import { getGroups } from "@/features/groups/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default async function AddGrantPage() {
  const beneficiaries = await getBeneficiaries()
  const groups = await getGroups()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          <Trans tKey="grants.new.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="grants.new.breadcrumb.new" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="grants.new.pageTitle" /></h1>
          <p className="text-muted-foreground mt-1"><Trans tKey="grants.new.subtitle" /></p>
        </div>
      </div>

      <GrantForm beneficiaries={beneficiaries} groups={groups} />
    </div>
  )
}
