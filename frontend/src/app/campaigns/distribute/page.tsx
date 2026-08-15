import { DistributeForm } from "@/features/campaigns/components/distribute-form";
import { getBeneficiaries } from "@/features/beneficiaries/actions";
import { financialActivitiesApi } from "@/lib/api/financial-activities";
import { getAuthSession } from "@/lib/auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Trans } from "@/components/shared/trans";

export default async function CampaignDistributePage() {
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  const [activitiesRes, beneficiaries] = await Promise.all([
    financialActivitiesApi.list({ status: "ACTIVE", page_size: 1000 }, token).catch(() => ({ items: [] })),
    getBeneficiaries(),
  ]);

  const campaignsWithBalances = (activitiesRes.items || []).map((c) => ({
    id: c.id,
    name: c.name,
    balance: c.current_balance || 0,
  }));

  const mappedBeneficiaries = beneficiaries.map((b) => ({
    id: b.id,
    fullName: b.fullName,
    beneficiaryId: b.beneficiaryId,
  }));

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
  );
}
