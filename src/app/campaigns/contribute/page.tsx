import { CampaignContributionForm } from "@/features/campaigns/components/campaign-contribution-form"
import { getCampaigns } from "@/features/campaigns/actions"
import { getMembers } from "@/features/members/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default async function CampaignContributeGlobalPage() {
  const campaigns = await getCampaigns()
  const members = await getMembers()

  // Filter active campaigns for contribution
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE")

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          <Trans tKey="campaigns.contribute.breadcrumb.manage" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="campaigns.contribute.breadcrumb.contribute" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="campaigns.contribute.pageTitle" /></h1>
          <p className="text-muted-foreground"><Trans tKey="campaigns.contribute.subtitle" /></p>
        </div>
      </div>

      <CampaignContributionForm 
        campaigns={activeCampaigns}
        members={members} 
      />
    </div>
  )
}
