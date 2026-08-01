import { getUserProfile } from "@/features/profile/actions"
import { ProfileForm } from "@/features/profile/components/profile-form"
import { Trans } from "@/components/shared/trans";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const profile = await getUserProfile()
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app.my_profile" /></h1>
        <p className="text-muted-foreground"><Trans tKey="profile.title" /></p>
      </div>
      <ProfileForm initialData={profile} />
    </div>
  )
}
