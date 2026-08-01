import { getGroups } from "@/features/member-requests/actions"
import { MemberRequestForm } from "@/features/member-requests/components/member-request-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Member Request Form",
}

export default async function MemberRequestPage() {
  const groups = await getGroups()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <MemberRequestForm groups={groups} />
      </div>
    </div>
  )
}
