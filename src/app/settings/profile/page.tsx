import { getFoundationProfile } from "@/features/settings/actions"
import { ProfileForm } from "@/features/settings/components/profile-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function FoundationProfilePage() {
  const profile = await getFoundationProfile()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foundation Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your organization's core information.
          </p>
        </div>
      </div>

      <ProfileForm initialData={profile} />
    </div>
  )
}
