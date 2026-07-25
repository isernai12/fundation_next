import { getAllCampaignContributions, getCampaigns } from "@/features/campaigns/actions"
import Link from "next/link"
import { ChevronRight, Plus, Building2, TrendingUp, Users, HandCoins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignContributionsTable } from "@/features/campaigns/components/campaign-contributions-table"

export default async function CampaignContributionsManagePage() {
  const contributions = await getAllCampaignContributions()
  const campaigns = await getCampaigns()

  // Calculate high-level metrics for quick summary cards
  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0)
  const memberContributionsCount = contributions.filter(c => c.memberId).length
  const donorContributionsCount = contributions.filter(c => c.donorId).length

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          তহবিল কার্যক্রম
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">তহবিল গ্রহণ ব্যবস্থাপনা</span>
      </div>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">তহবিল গ্রহণ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground text-sm mt-1">
            তহবিল কার্যক্রমে জমাকৃত সকল অর্থ গ্রহণের লেনদেন, রিসিট প্রিন্ট, এবং লেজার সমন্বয় ব্যবস্থাপনা।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/campaigns/contribute">
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> নতুন তহবিল গ্রহণ (Receive Fund)
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm bg-gradient-to-br from-card to-secondary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">মোট সংগৃহীত তহবিল</CardTitle>
            <HandCoins className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold font-mono tracking-tight text-foreground">
              ৳{totalAmount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              মোট লেনদেন: <span className="font-semibold">{contributions.length} টি</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">সদস্যদের অবদান</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {memberContributionsCount} <span className="text-sm font-normal text-muted-foreground">টি লেনদেন</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              নিবন্ধিত সদস্যদের মাধ্যমে সংগৃহীত
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">ডোনার ও সাধারণ অবদান</CardTitle>
            <Building2 className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">
              {donorContributionsCount} <span className="text-sm font-normal text-muted-foreground">টি লেনদেন</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              বাহ্যিক অনুদানদাতা ও শুভাকাঙ্ক্ষী
            </p>
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
