import { getMember } from "@/features/members/actions"
import { getGroups } from "@/features/groups/actions"
import { MemberForm } from "@/features/members/components/member-form"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const member = await getMember(resolvedParams.id)
  
  if (!member) return notFound()

  const groups = await getGroups()

  // Convert the DB member to initial form data matching MemberFormValues
  const initialData = {
    fullName: `${member.firstName} ${member.lastName}`,
    fatherName: member.fatherName || "",
    motherName: member.motherName || "",
    gender: member.gender || "",
    dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : "",
    bloodGroup: member.bloodGroup || "",
    maritalStatus: member.maritalStatus || "",
    nationalId: member.nationalId || "",
    presentAddress: member.presentAddress || "",
    permanentAddress: member.permanentAddress || "",
    
    mobile: member.mobile || "",
    altMobile: member.altMobile || "",
    email: member.email || "",
    
    education: member.education || "",
    occupation: member.occupation || "",
    workplace: member.workplace || "",
    designation: member.designation || "",
    
    skills: member.skills ? JSON.parse(member.skills) : [],
    
    reference: member.reference || "",
    reasonForJoining: member.reasonForJoining || "",
    
    participation: member.participation ? JSON.parse(member.participation) : ["Monthly Contribution"],
    
    emergencyContactName: member.emergencyContactName || "",
    emergencyContactRelation: member.emergencyContactRelation || "",
    emergencyContactMobile: member.emergencyContactMobile || "",
    
    declarationAccepted: true,
    
    groupId: member.groupId || "",
    status: member.status,
    memberType: member.memberType || "REGULAR",
    joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : "",
    remarks: member.remarks || "",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members/manage">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
          <p className="text-muted-foreground">Update information for {member.firstName} {member.lastName}.</p>
        </div>
      </div>
      
      <MemberForm 
        groups={groups} 
        mode="edit" 
        memberId={member.id} 
        initialData={initialData as any} 
        member={member} 
      />
    </div>
  )
}
