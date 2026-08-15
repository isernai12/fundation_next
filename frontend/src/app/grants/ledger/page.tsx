import { Trans } from "@/components/shared/trans";
import { GrantLedgerTable } from "@/features/grants/components/grant-ledger-table";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getGrants } from "@/features/grants/actions";

export default async function GrantLedgerPage({ searchParams }: { searchParams: Promise<{ grantId?: string }> }) {
  const resolvedParams = await searchParams;
  const { grantId } = resolvedParams;

  const grants = await getGrants();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              <Trans tKey="grants.manage.breadcrumb.finance" /></Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/grants" className="hover:text-primary transition-colors">
              <Trans tKey="grants.ledger.breadcrumb.home" /></Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground"><Trans tKey="grants.ledger.breadcrumb.ledger" /></span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="grants.ledger.pageTitle" /></h1>
              <p className="text-muted-foreground mt-1">
                <Trans tKey="grants.ledger.subtitle" />
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.totalGrants" /></div>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.totalAmount" /></div>
                <div className="text-2xl font-bold text-blue-600">৳0</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.currentBalance" /></div>
                <div className="text-2xl font-bold text-orange-600">৳0</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.thisMonth" /></div>
                <div className="text-2xl font-bold text-green-600">৳0</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <GrantLedgerTable transactions={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
