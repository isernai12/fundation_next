import { getSystemSettings } from "@/features/settings/actions"
import { GeneralSettingsForm } from "@/features/settings/components/general-settings-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function GeneralSettingsPage() {
  const settings = await getSystemSettings()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage system-wide configuration and behavior.
          </p>
        </div>
      </div>

      <GeneralSettingsForm initialData={settings} />
    </div>
  )
}
