import { getAllCampaignContributions, getCampaigns } from "@/features/campaigns/actions"
import Link from "next/link"
import { ChevronRight, Plus, Building2, TrendingUp, Users, HandCoins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignContributionsTable } from "@/features/campaigns/components/campaign-contributions-table"
import { Trans } from "@/components/shared/trans";

export default async function CampaignContributionsManagePage() {
  const contributions = await getAllCampaignContributions()
  const campaigns = await getCampaigns()

  // Calculate high-level metrics for quick summary cards
  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0)
  const memberContributionsCount = contributions.filter(c => c.memberId).length
  const donorContributionsCount = contributions.filter(c => c.donorId).length

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          <Trans tKey="app.text" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="app.text" /></span>
      </div>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground"><Trans tKey="app.text" /></h1>
          <p className="text-muted-foreground text-sm mt-1">
            <Trans tKey="app.text" /></p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/campaigns/contribute">
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> <Trans tKey="app.receive_fund" /></Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm bg-gradient-to-br from-card to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground"><Trans tKey="app.text" /></CardTitle>
            <HandCoins className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
              ৳{totalAmount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Trans tKey="app.text" /><span className="font-semibold">{contributions.length} <Trans tKey="app.text" /></span>
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground"><Trans tKey="app.text" /></CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {memberContributionsCount} <span className="text-sm font-normal text-muted-foreground"><Trans tKey="app.text" /></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Trans tKey="app.text" /></p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground"><Trans tKey="app.text" /></CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {donorContributionsCount} <span className="text-sm font-normal text-muted-foreground"><Trans tKey="app.text" /></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <Trans tKey="app.text" /></p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Table Component */}
      <CampaignContributionsTable 
        data={contributions} 
        campaigns={campaigns} 
      />
    </div>
  )
}
