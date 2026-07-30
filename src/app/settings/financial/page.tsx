import { getSystemSettings } from "@/features/settings/actions"
import { FinancialRulesForm } from "@/features/settings/components/financial-rules-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function FinancialRulesPage() {
  const settings = await getSystemSettings()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Rules</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure default currency, numbering, and fiscal year.
          </p>
        </div>
      </div>

      <FinancialRulesForm initialData={settings} />
    </div>
  )
}
