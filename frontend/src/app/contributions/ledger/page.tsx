import { ContributionLedgerView } from "@/features/contributions/components/contribution-ledger-view"
import { getFoundationProfile } from "@/features/settings/actions"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function ContributionLedgerPage() {
  const [profile, session] = await Promise.all([
    getFoundationProfile().catch(() => null),
    getAuthSession().catch(() => null),
  ])

  const foundationName = profile?.name || "Foundation ERP"
  const foundationLogo = (profile as any)?.logo || null
  const userName = (session?.user as any)?.name || (session?.user as any)?.username || "Admin"

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground print:hidden">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          Fund Collection
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Contribution Ledger</span>
      </div>

      <ContributionLedgerView
        foundationName={foundationName}
        foundationLogo={foundationLogo}
        userName={userName}
      />
    </div>
  )
}
