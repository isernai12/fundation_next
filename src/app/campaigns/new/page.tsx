import { CampaignForm } from "@/features/campaigns/components/campaign-form"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default function NewCampaignPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          <Trans tKey="app.text" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="app.text" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app.text" /></h1>
          <p className="text-muted-foreground"><Trans tKey="app.text" /></p>
        </div>
      </div>

      <CampaignForm />
    </div>
  )
}
