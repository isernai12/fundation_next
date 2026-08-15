import { formatCurrency } from "@/lib/format";
import { getMemberDuesList } from "@/features/members/due-actions";
import { MemberDuesTable } from "@/features/members/components/member-dues-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, TrendingUp, Wallet, Banknote } from "lucide-react";
import { Trans } from "@/components/shared/trans";
import { reportsApi } from "@/lib/api/reports";
import { getAuthSession } from "@/lib/auth";

export default async function MemberDuesPage() {
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  const [dues, stats] = await Promise.all([
    getMemberDuesList(),
    reportsApi.getDashboardStats(token).catch(() => null),
  ]);

  const totalMembers = dues.length;
  const membersWithDue = dues.filter((m) => m.currentDue > 0).length;
  const totalOutstanding = dues.reduce((acc, m) => acc + m.currentDue, 0);
  const totalAdvanceBalance = dues.reduce((acc, m) => acc + m.advanceBalance, 0);

  const collectedThisMonth = stats?.monthlyChartData?.slice(-1)[0]?.contributions || 0;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="members.dues_page.title" /></h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><Trans tKey="members.dues_page.total_members" /></CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><Trans tKey="members.dues_page.members_in_due" /></CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{membersWithDue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><Trans tKey="members.dues_page.total_outstanding" /></CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">৳{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><Trans tKey="members.dues_page.total_advance" /></CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">৳{formatCurrency(totalAdvanceBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><Trans tKey="members.dues_page.collected_this_month" /></CardTitle>
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
  );
}
