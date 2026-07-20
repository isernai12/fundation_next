import { formatCurrency } from "@/lib/format"
import { getDashboardStats } from "@/features/dashboard/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts-dynamic"
import { Users, Building, DollarSign, PiggyBank, Gift, Wallet, Activity } from "lucide-react"

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Foundation Cash Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{formatCurrency(stats.currentCashBalance)}</div>
            <p className="text-xs text-muted-foreground">Across all ledgers</p>
          </CardContent>
        </Card>

        {/* Foundation Total Fund */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Foundation Fund</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{formatCurrency(stats.foundationTotalFund)}</div>
            <p className="text-xs text-muted-foreground">General Fund Equity</p>
          </CardContent>
        </Card>

        {/* Total Group Funds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Group Funds</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{formatCurrency(stats.totalGroupFunds)}</div>
            <p className="text-xs text-muted-foreground">Combined equity across all groups</p>
          </CardContent>
        </Card>

        {/* Total Contributions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{formatCurrency(stats.totalContributions)}</div>
            <p className="text-xs text-muted-foreground">Lifetime collected</p>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeMembers} Active &bull; {stats.inactiveMembers} Inactive</p>
          </CardContent>
        </Card>

        {/* Groups & Beneficiaries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups / Beneficiaries</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups} / {stats.totalBeneficiaries}</div>
          </CardContent>
        </Card>

        {/* Loans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveLoans}</div>
            <p className="text-xs text-muted-foreground">৳{formatCurrency(stats.outstandingLoanAmount)} Outstanding</p>
          </CardContent>
        </Card>

        {/* Grants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGrants}</div>
            <p className="text-xs text-muted-foreground">Approved grants</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts monthlyData={stats.monthlyChartData} groupFundData={stats.groupFundDistribution} />
    </div>
  )
}
