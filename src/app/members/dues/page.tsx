import { formatCurrency } from "@/lib/format"
import { getMemberDuesList } from "@/features/members/due-actions"
import { MemberDuesTable } from "@/features/members/components/member-dues-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertCircle, TrendingUp, Wallet, Banknote } from "lucide-react"

export default async function MemberDuesPage() {
  const dues = await getMemberDuesList()

  const totalMembers = dues.length
  const membersWithDue = dues.filter(m => m.currentDue > 0).length
  const totalOutstanding = dues.reduce((acc, m) => acc + m.currentDue, 0)
  const totalAdvanceBalance = dues.reduce((acc, m) => acc + m.advanceBalance, 0)
  
  // Aggregate collected this month based on the payments (approximated here by recent payments in actual DB logic, 
  // but since we only have `lastCollectionDate` per member in the dues list, 
  // we can fetch the real collected this month directly via prisma if needed. Let's do a simple prisma query here).
  
  // Instead of querying prisma directly here, I'll export a small helper from due-actions or just calculate it.
  // Actually, I'll query it inline just for the summary card.
  const { prisma } = await import("@/lib/prisma")
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const collectedThisMonthAgg = await prisma.contributionPayment.aggregate({
    where: { paymentDate: { gte: startOfMonth } },
    _sum: { amount: true }
  })
  const collectedThisMonth = collectedThisMonthAgg._sum.amount || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Member Due List</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members With Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{membersWithDue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">৳{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">৳{formatCurrency(totalAdvanceBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected This Month</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{formatCurrency(collectedThisMonth)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <MemberDuesTable data={dues} />
      </div>
    </div>
  )
}
