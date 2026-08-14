import { notFound } from "next/navigation"
import { getMemberRequest } from "@/features/member-requests/actions"
import { authorizePage } from "@/lib/rbac"
import { Trans } from "@/components/shared/trans"
import { RequestActions } from "@/features/member-requests/components/request-actions"
import { Badge } from "@/components/ui/badge"
import { MemberProfileLayout, MemberProfileData } from "@/features/members/components/member-profile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function MemberRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("Members", "View")
  const resolvedParams = await params;
  if (!resolvedParams.id) {
    notFound()
  }
  const request = await getMemberRequest(resolvedParams.id)

  if (!request) {
    notFound()
  }

  let groupName = null
  let groupCode = null
  
  if (request.groupId) {
    const group = await prisma.group.findUnique({ where: { id: request.groupId } })
    if (group) {
      groupName = group.name
      groupCode = group.code
    }
  }

  const documents = request.documents ? JSON.parse(request.documents) : []

  const profileData: MemberProfileData = {
    ...request,
    referenceName: request.referenceName,
    referenceRelation: request.referenceRelation,
    referenceMobile: request.referenceMobile,
    groupName: groupName,
    groupCode: groupCode,
    joinDate: request.submittedAt,
    applicationNumber: request.applicationNumber,
    documents: documents
  }

  const statusBadge = (
    <Badge 
      variant="outline" 
      className={`text-sm px-3 py-1 ${
        request.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
        request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
        request.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border-rose-200' :
        'bg-blue-100 text-blue-800 border-blue-200'
      }`}
    >
      {request.status === "PENDING" ? <Trans tKey="member-requests.status.pending" /> 
      : request.status === "APPROVED" ? <Trans tKey="member-requests.status.approved" />
      : request.status === "REJECTED" ? <Trans tKey="member-requests.status.rejected" />
      : request.status === "NEEDS_CHANGES" ? <Trans tKey="member-requests.status.needsChanges" />
      : request.status}
    </Badge>
  )

  const adminNotes = (
    <div className="space-y-4">
      {request.adminMessage && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2"><Trans tKey="member-requests.status.admin_message" /></h3>
            <p className="text-blue-700 dark:text-blue-400">{request.adminMessage}</p>
          </CardContent>
        </Card>
      )}

      {request.rejectionReason && (
        <Card className="border-rose-200 bg-rose-50 dark:bg-rose-950 dark:border-rose-900">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-rose-800 dark:text-rose-300 mb-2"><Trans tKey="member-requests.status.rejection_reason" /></h3>
            <p className="text-rose-700 dark:text-rose-400">{request.rejectionReason}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-6">
        <RequestActions requestId={request.id} status={request.status} />
      </div>
    </div>
  )

  return (
    <MemberProfileLayout
      data={profileData}
      titleNode={<><Trans tKey="member-requests.detail.title" /> {request.applicationNumber}</>}
      backHref="/members/requests"
      statusNode={statusBadge}
      bottomActionNode={adminNotes}
    />
  )
}
