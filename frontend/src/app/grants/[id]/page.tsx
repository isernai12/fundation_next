import { formatCurrency, formatDate } from "@/lib/format"
import { getGrant } from "@/features/grants/actions"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DocumentList } from "@/features/documents/components/document-list"
import { Trans } from "@/components/shared/trans";

export default async function GrantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const grant = await getGrant(resolvedParams.id)

  if (!grant) return notFound()

  const documents = await getDocumentsByEntity("GRANT", grant.id)
  const categories = await getDocumentCategories()

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-background text-foreground p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/grants" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold"><Trans tKey="grants.details.pageTitle" /></h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/grants/${grant.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> <Trans tKey="grants.details.editBtn" /></Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3"><Trans tKey="grants.details.summary" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="grants.details.grantNo" /></td><td className="py-2 font-medium">{grant.grantNumber}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.beneficiary" /></td><td className="py-2">{grant.beneficiary?.fullName || 'নাম পাওয়া যায়নি'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.mobile" /></td><td className="py-2">{grant.beneficiary?.phone || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.date" /></td><td className="py-2">{grant.dateApproved ? formatDate(grant.dateApproved) : 'N/A'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.amount" /></td><td className="py-2 font-bold text-green-600">৳{formatCurrency(grant.amount)}</td></tr>
                <tr className="border-b">
                  <td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.status" /></td>
                  <td className="py-2">
                    <Badge variant={grant.status === "PAID" ? "default" : "secondary"}>
                      {grant.status}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="grants.details.information" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="grants.details.purpose" /></td><td className="py-2">{grant.purpose}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.remarks" /></td><td className="py-2 whitespace-pre-wrap">{grant.notes || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="grants.details.allocations" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {grant.allocations.length === 0 ? (
                  <tr><td className="py-2 text-muted-foreground"><Trans tKey="grants.details.noAllocations" /></td></tr>
                ) : (
                  grant.allocations.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 w-2/3">{a.fund.name} <span className="text-xs text-muted-foreground">({a.fund.group?.name || "Foundation"})</span></td>
                      <td className="py-2 font-medium">৳{formatCurrency(a.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="grants.details.systemInfo" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="grants.details.createdBy" /></td><td className="py-2">{grant.createdBy || 'সিস্টেম'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.createdAt" /></td><td className="py-2">{formatDate(grant.createdAt)}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="grants.details.updatedAt" /></td><td className="py-2">{formatDate(grant.updatedAt)}</td></tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>

      <div className="print:hidden">
        <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-8"><Trans tKey="grants.details.documents" /></h2>
        <DocumentList targetType="GRANT" entityId={grant.id} documents={documents} categories={categories} />
      </div>
    </div>
  )
}
