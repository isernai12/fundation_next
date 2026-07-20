import { getGroups } from "@/features/groups/actions"
import { AddMemberForm } from "@/features/members/components/add-member-form"

export default async function AddMemberPage() {
  const groups = await getGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">নতুন সদস্য যুক্ত করুন</h1>
      </div>
      <AddMemberForm groups={groups} />
    </div>
  )
}
