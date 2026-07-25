import { getUserProfile } from "@/features/profile/actions"
import { ProfileForm } from "@/features/profile/components/profile-form"

export default async function ProfilePage() {
  const profile = await getUserProfile()
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">আমার প্রোফাইল (My Profile)</h1>
        <p className="text-muted-foreground">আপনার অ্যাকাউন্ট তথ্য পরিচালনা করুন</p>
      </div>
      <ProfileForm initialData={profile} />
    </div>
  )
}
