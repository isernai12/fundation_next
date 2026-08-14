import { DistributeForm } from "@/features/campaigns/components/distribute-form"
import { getCampaigns } from "@/features/campaigns/actions"
import { getBeneficiaries } from "@/features/beneficiaries/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";
import { prisma } from "@/lib/prisma"

export default async function CampaignDistributePage() {
  const campaigns = await getCampaigns()
  const beneficiaries = await getBeneficiaries()

  // Filter active campaigns
  const activeCampaigns = campaigns.filter(c => c.status === "ACTIVE")

  // Calculate balances for each active campaign
  const campaignsWithBalances = await Promise.all(activeCampaigns.map(async (c) => {
    const campaignFund = await prisma.fund.findFirst({ where: { name: `Campaign: ${c.name}` } })
    let balance = 0
    if (campaignFund) {
      const ledgerEntries = await prisma.ledgerEntry.findMany({ where: { fundId: campaignFund.id } })
      balance = ledgerEntries.reduce((sum, entry) => sum + (entry.isCredit ? entry.amount : -entry.amount), 0)
    }
    return {
      id: c.id,
      name: c.name,
      balance
    }
  }))

  const mappedBeneficiaries = beneficiaries.map(b => ({
    id: b.id,
    fullName: b.fullName,
    beneficiaryId: b.beneficiaryId
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          <Trans tKey="campaigns.distribute.breadcrumb.manage" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="campaigns.distribute.breadcrumb.distribute" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="campaigns.distribute.pageTitle" /></h1>
          <p className="text-muted-foreground"><Trans tKey="campaigns.distribute.subtitle" /></p>
        </div>
      </div>

      <DistributeForm 
        campaigns={campaignsWithBalances}
        beneficiaries={mappedBeneficiaries} 
      />
    </div>
  )
}
