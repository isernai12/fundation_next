import { getGroupFundSummary } from "@/features/groups/actions"
import { GroupSelector } from "@/features/groups/components/group-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, PiggyBank, HandCoins, Landmark, ArrowDownToLine, Users } from "lucide-react"

export default async function GroupFundPage({ searchParams }: { searchParams: { groupId?: string } }) {
  const groupId = searchParams.groupId
  const summary = groupId ? await getGroupFundSummary(groupId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Group Fund</h1>
          <p className="text-muted-foreground">View financial summaries and balances for each group.</p>
        </div>
        <GroupSelector />
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.currentBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available liquidity</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalContributions.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Lifetime contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans Disbursed</CardTitle>
              <HandCoins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalLoans.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Active and completed loans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loan Returns</CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalLoanReturns.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Principal & interest collected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grants</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalGrants.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Non-refundable grants</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.openingBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Initial fund allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.memberCount}</div>
              <p className="text-xs text-muted-foreground">Contributing members</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
