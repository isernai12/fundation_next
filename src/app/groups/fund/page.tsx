import { formatCurrency } from "@/lib/format"
import { getGroupFundSummary, getGroupTransactions } from "@/features/groups/actions"
import { GroupSelector } from "@/features/groups/components/group-selector"
import { GroupTransactionsTable } from "@/features/groups/components/group-transactions-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, PiggyBank, HandCoins, Landmark, Receipt, Calendar, Filter, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Trans } from "@/components/shared/trans"
import Link from "next/link"

export default async function GroupFundPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const resolvedParams = await searchParams
  const groupId = resolvedParams.groupId
  const summary = groupId ? await getGroupFundSummary(groupId) : null
  const transactions = groupId ? await getGroupTransactions(groupId) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/groups" className="hover:text-primary transition-colors">
          <Trans tKey="groups.manage.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="groups.fund.pageTitle" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="groups.fund.pageTitle" /></h1>
          <p className="text-muted-foreground mt-1"><Trans tKey="groups.fund.subtitle" /></p>
        </div>
        <div className="flex items-center space-x-2">
          <GroupSelector />
        </div>
      </div>

      {!groupId || !summary ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold"><Trans tKey="groups.fund.emptyTitle" /></div>
            <p className="text-muted-foreground"><Trans tKey="groups.fund.emptySubtitle" /></p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-wrap items-center gap-4">
              <div className="font-medium flex items-center mr-4"><Filter className="h-4 w-4 mr-2"/> <Trans tKey="groups.fund.filters.title" /></div>
              <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> <Trans tKey="groups.fund.filters.date" /></Button>
              <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> <Trans tKey="groups.fund.filters.month" /></Button>
              <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> <Trans tKey="groups.fund.filters.year" /></Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="groups.fund.cards.totalFund.title" /></CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency((summary as any).totalFund || summary.currentBalance || 0)}</div>
                <p className="text-xs text-muted-foreground"><Trans tKey="groups.fund.cards.totalFund.desc" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="groups.fund.cards.currentBalance.title" /></CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">৳{formatCurrency(summary.currentBalance)}</div>
                <p className="text-xs text-muted-foreground"><Trans tKey="groups.fund.cards.currentBalance.desc" /></p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="groups.fund.cards.totalContributions.title" /></CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency(summary.totalContributions)}</div>
                <p className="text-xs text-muted-foreground"><Trans tKey="groups.fund.cards.totalContributions.desc" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="groups.fund.cards.totalDonations.title" /></CardTitle>
                <HandCoins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency((summary as any).totalDonations || 0)}</div>
                <p className="text-xs text-muted-foreground"><Trans tKey="groups.fund.cards.totalDonations.desc" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="groups.fund.cards.totalGrants.title" /></CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency((summary as any).totalGrants || 0)}</div>
                <p className="text-xs text-muted-foreground"><Trans tKey="groups.fund.cards.totalGrants.desc" /></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="groups.fund.cards.totalExpenses.title" /></CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">৳{formatCurrency((summary as any).totalExpenses || 0)}</div>
                <p className="text-xs text-muted-foreground"><Trans tKey="groups.fund.cards.totalExpenses.desc" /></p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 pt-6">
            <h2 className="text-xl font-bold tracking-tight"><Trans tKey="groups.fund.history.title" /></h2>
            <GroupTransactionsTable data={transactions} />
          </div>
        </div>
      )}
    </div>
  )
}
