import { getMemberSignupGroups } from "@/features/groups/actions"
import { generateMemberId } from "@/features/members/actions"
import { MemberForm } from "@/features/members/components/member-form"
import { Trans } from "@/components/shared/trans";
import { authorizePage } from "@/lib/rbac";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Member",
};

export default async function AddMemberPage() {
  await authorizePage("Members", "Add")

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
