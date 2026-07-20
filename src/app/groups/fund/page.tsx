import { formatCurrency } from "@/lib/format"
import { getGroupFundSummary } from "@/features/groups/actions"
import { GroupSelector } from "@/features/groups/components/group-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, PiggyBank, HandCoins, Landmark, ArrowDownToLine, Receipt, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function GroupFundPage({ searchParams }: { searchParams: Promise<{ groupId?: string }> }) {
  const resolvedParams = await searchParams
  const groupId = resolvedParams.groupId
  const summary = groupId ? await getGroupFundSummary(groupId) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Fund</h1>
          <p className="text-muted-foreground">Show the financial position of a specific group.</p>
        </div>
        <div className="flex items-center space-x-2">
          <GroupSelector />
        </div>
      </div>

      {!groupId || !summary ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold">No Group Selected</div>
            <p className="text-muted-foreground">Please select a group from the dropdown above to view its fund summary.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-wrap items-center gap-4">
              <div className="font-medium flex items-center mr-4"><Filter className="h-4 w-4 mr-2"/> Filters:</div>
              <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> Date</Button>
              <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> Month</Button>
              <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> Year</Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fund</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency((summary as any).totalFund || summary.currentBalance || 0)}</div>
                <p className="text-xs text-muted-foreground">Overall fund size</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">৳{formatCurrency(summary.currentBalance)}</div>
                <p className="text-xs text-muted-foreground">Available liquid cash</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency(summary.totalContributions)}</div>
                <p className="text-xs text-muted-foreground">Member contributions received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <HandCoins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency((summary as any).totalDonations || 0)}</div>
                <p className="text-xs text-muted-foreground">External donations received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{formatCurrency(summary.totalGrants)}</div>
                <p className="text-xs text-muted-foreground">Grants disbursed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">৳{formatCurrency((summary as any).totalExpenses || 0)}</div>
                <p className="text-xs text-muted-foreground">Operational expenses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
