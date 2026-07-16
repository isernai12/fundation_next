import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Phone, Briefcase, ChevronRight } from "lucide-react"
import { DocumentList } from "@/features/documents/components/document-list"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"

export default async function BeneficiaryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: resolvedParams.id },
    include: { member: true }
  })

  if (!beneficiary) return notFound()

  const documents = await getDocumentsByEntity("BENEFICIARY", beneficiary.id)
  const categories = await getDocumentCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/beneficiaries" className="hover:text-primary transition-colors">
          Beneficiaries
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{beneficiary.firstName} {beneficiary.lastName}</span>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/beneficiaries">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {beneficiary.firstName} {beneficiary.lastName}
          </h1>
          <div className="flex items-center space-x-2 text-muted-foreground mt-1">
            <span>{beneficiary.beneficiaryId}</span>
            <span>&bull;</span>
            <Badge variant={beneficiary.status === "ACTIVE" ? "default" : "secondary"}>
              {beneficiary.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5" /> <span>Personal Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-muted-foreground">National ID</span>
                <p>{beneficiary.nationalId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground">Occupation</span>
                <p>{beneficiary.occupation || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-muted-foreground">Address</span>
                <p>{beneficiary.address || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Phone className="h-5 w-5" /> <span>Contact & Link</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-muted-foreground">Mobile</span>
                <p>{beneficiary.mobile}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-muted-foreground">Email</span>
                <p>{beneficiary.email || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-semibold text-muted-foreground">Linked Member</span>
                <p>{beneficiary.member ? `${beneficiary.member.firstName} ${beneficiary.member.lastName} (${beneficiary.member.memberId})` : 'None'}</p>
              </div>
              {beneficiary.member && (
                <div className="col-span-2">
                  <span className="text-sm font-semibold text-muted-foreground">Relation to Member</span>
                  <p>{beneficiary.relationToMember || 'N/A'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <DocumentList targetType="BENEFICIARY" entityId={beneficiary.id} documents={documents} categories={categories} />
    </div>
  )
}
