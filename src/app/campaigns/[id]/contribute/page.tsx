import { CampaignContributionForm } from "@/features/campaigns/components/campaign-contribution-form"
import { getCampaign } from "@/features/campaigns/actions"
import { getMembers } from "@/features/members/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { notFound } from "next/navigation"

export default async function CampaignContributePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const campaign = await getCampaign(resolvedParams.id)
  
  if (!campaign) {
    notFound()
  }

  const members = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          তহবিল কার্যক্রম
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/campaigns/${campaign.id}`} className="hover:text-primary transition-colors">
          {campaign.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">তহবিলে অর্থ গ্রহণ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">তহবিলে অর্থ গ্রহণ</h1>
          <p className="text-muted-foreground">সদস্য বা অনুদানদাতার কাছ থেকে এই কার্যক্রমে অনুদান রেকর্ড করুন।</p>
        </div>
      </div>

      <CampaignContributionForm 
        campaignId={campaign.id}
        campaigns={[campaign]}
        members={members} 
      />
    </div>
  )
}
