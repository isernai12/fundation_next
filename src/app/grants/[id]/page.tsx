import { getGrant, approveGrant } from "@/features/grants/actions"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { GrantDisbursementDialog } from "@/features/grants/components/grant-disbursement-dialog"
import { DocumentList } from "@/features/documents/components/document-list"

export default async function GrantDetailsPage({ params }: { params: { id: string } }) {
  const grant = await getGrant(params.id)

  if (!grant) return notFound()

  const funds = await prisma.fund.findMany({ include: { group: true } })
  const documents = await getDocumentsByEntity("GRANT", grant.id)
  const categories = await getDocumentCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/grants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grant {grant.grantNumber}</h1>
            <div className="flex items-center space-x-2 text-muted-foreground mt-1">
              <span>Beneficiary: {grant.beneficiary?.firstName} {grant.beneficiary?.lastName}</span>
              <span>&bull;</span>
              <Badge variant={
                grant.status === "PAID" ? "default" :
                grant.status === "PENDING" ? "outline" : "destructive"
              }>
                {grant.status}
              </Badge>
            </div>
          </div>
          <div className="space-x-2">
            {grant.status === "PENDING" && (
              <form action={async () => {
                "use server"
                await approveGrant(grant.id)
              }}>
                <Button type="submit"><CheckCircle className="mr-2 h-4 w-4" /> Approve Grant</Button>
              </form>
            )}
            {grant.status === "APPROVED" && (
              <GrantDisbursementDialog grantId={grant.id} grantAmount={grant.amount} funds={funds} />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm font-semibold">Amount</span><p className="text-2xl font-bold">${(grant.amount / 100).toFixed(2)}</p></div>
              <div><span className="text-sm font-semibold">Purpose</span><p className="text-muted-foreground">{grant.purpose}</p></div>
              <div><span className="text-sm font-semibold">Requested On</span><p className="text-muted-foreground">{new Date(grant.createdAt).toLocaleDateString()}</p></div>
              <div><span className="text-sm font-semibold">Approved On</span><p className="text-muted-foreground">{grant.dateApproved ? new Date(grant.dateApproved).toLocaleDateString() : 'N/A'}</p></div>
              <div><span className="text-sm font-semibold">Disbursed On</span><p className="text-muted-foreground">{grant.disbursedDate ? new Date(grant.disbursedDate).toLocaleDateString() : 'N/A'}</p></div>
              <div><span className="text-sm font-semibold">Notes</span><p className="text-muted-foreground">{grant.notes || 'None'}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source Fund Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            {grant.allocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No funds allocated yet.</p>
            ) : (
              <div className="space-y-4">
                {grant.allocations.map(a => (
                  <div key={a.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{a.fund.name}</p>
                      <p className="text-xs text-muted-foreground">{a.fund.group?.name || "Foundation Fund"}</p>
                    </div>
                    <div className="font-bold">${(a.amount / 100).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <DocumentList targetType="GRANT" entityId={grant.id} documents={documents} categories={categories} />
    </div>
  )
}
