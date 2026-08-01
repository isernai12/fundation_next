import { getGroups, submitMemberRequest } from "@/features/member-requests/actions"
import { MemberForm } from "@/features/members/components/member-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Member Request Form",
}

export default async function MemberRequestPage() {
  const groups = await getGroups()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <MemberForm 
          groups={groups} 
          mode="request" 
          onSubmitAction={submitMemberRequest}
        />
      </div>
    </div>
  )
}
