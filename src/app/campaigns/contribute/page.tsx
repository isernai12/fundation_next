import { CampaignContributionForm } from "@/features/campaigns/components/campaign-contribution-form"
import { getCampaigns } from "@/features/campaigns/actions"
import { getMembers } from "@/features/members/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function CampaignContributeGlobalPage() {
  const campaigns = await getCampaigns()
  const members = await getMembers()

  // Filter active campaigns for contribution
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          তহবিল কার্যক্রম
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">তহবিলে অর্থ গ্রহণ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">তহবিলে অর্থ গ্রহণ</h1>
          <p className="text-muted-foreground">যে কোনো চলমান কার্যক্রমে সদস্য বা অনুদানদাতার কাছ থেকে অর্থ গ্রহণ করুন।</p>
        </div>
      </div>

      <CampaignContributionForm 
        campaigns={activeCampaigns}
        members={members} 
      />
    </div>
  )
}
