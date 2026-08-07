import { getMemberSignupGroups } from "@/features/groups/actions"
import { generateMemberId } from "@/features/members/actions"
import { MemberForm } from "@/features/members/components/member-form"
import { Trans } from "@/components/shared/trans";

export default async function AddMemberPage() {
  const groups = await getMemberSignupGroups()
  const nextMemberId = await generateMemberId()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="members.new_member" /></h1>
      </div>
      <MemberForm groups={groups} mode="create" initialData={{ memberId: nextMemberId }} />
    </div>
  )
}
