import { getMember } from "@/features/members/actions"
import { getMemberLedger } from "@/features/ledger/actions"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Briefcase, Phone, AlertCircle, FileText, Activity } from "lucide-react"
import { MemberLedgerTable } from "@/features/ledger/components/member-ledger-table"
import { DocumentList } from "@/features/documents/components/document-list"

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const member = await getMember(params.id)

  if (!member) return notFound()

  const ledgerData = await getMemberLedger(params.id)
  const documents = await getDocumentsByEntity("MEMBER", params.id)
  const categories = await getDocumentCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{member.firstName} {member.lastName}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground mt-1">
            <span>ID: {member.memberId}</span>
            <span>&bull;</span>
            <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
              {member.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><span className="text-sm font-semibold">Group</span><p className="text-muted-foreground">{member.group?.name || "No Group"} {member.group?.code ? `(${member.group.code})` : ""}</p></div>
            <div><span className="text-sm font-semibold">Join Date</span><p className="text-muted-foreground">{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Status</span><p className="text-muted-foreground">{member.status}</p></div>
            <div><span className="text-sm font-semibold">Remarks</span><p className="text-muted-foreground">{member.remarks || 'None'}</p></div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><span className="text-sm font-semibold">Father's Name</span><p className="text-muted-foreground">{member.fatherName || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Mother's Name</span><p className="text-muted-foreground">{member.motherName || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Gender</span><p className="text-muted-foreground">{member.gender || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Date of Birth</span><p className="text-muted-foreground">{member.dob ? new Date(member.dob).toLocaleDateString() : 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">National ID</span><p className="text-muted-foreground">{member.nationalId || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Blood Group</span><p className="text-muted-foreground">{member.bloodGroup || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Occupation</span><p className="text-muted-foreground">{member.occupation || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Monthly Income</span><p className="text-muted-foreground">{member.monthlyIncome ? `$${member.monthlyIncome / 100}` : 'N/A'}</p></div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><span className="text-sm font-semibold">Mobile</span><p className="text-muted-foreground">{member.mobile || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Alt Mobile</span><p className="text-muted-foreground">{member.altMobile || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Email</span><p className="text-muted-foreground">{member.email || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Phone</span><p className="text-muted-foreground">{member.phone || 'N/A'}</p></div>
            <div className="col-span-2"><span className="text-sm font-semibold">Present Address</span><p className="text-muted-foreground">{member.presentAddress || 'N/A'}</p></div>
            <div className="col-span-2"><span className="text-sm font-semibold">Permanent Address</span><p className="text-muted-foreground">{member.permanentAddress || 'N/A'}</p></div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div><span className="text-sm font-semibold">Name</span><p className="text-muted-foreground">{member.emergencyContactName || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Mobile</span><p className="text-muted-foreground">{member.emergencyContactMobile || 'N/A'}</p></div>
            <div><span className="text-sm font-semibold">Relation</span><p className="text-muted-foreground">{member.emergencyContactRelation || 'N/A'}</p></div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Member Ledger</h2>
        <MemberLedgerTable data={ledgerData} />
      </div>

      <Separator />

      <DocumentList targetType="MEMBER" entityId={member.id} documents={documents} categories={categories} />

      <Separator />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholders for Future Modules */}
      </div>
    </div>
  )
}
