import { BeneficiarySelector } from "@/features/beneficiaries/components/beneficiary-selector"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { DocumentList } from "@/features/documents/components/document-list"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default async function BeneficiaryDocumentsPage({ searchParams }: { searchParams: Promise<{ beneficiaryId?: string }> }) {
  const resolvedParams = await searchParams
  const beneficiaryId = resolvedParams.beneficiaryId

  const documents = beneficiaryId ? await getDocumentsByEntity("BENEFICIARY", beneficiaryId) : []
  const categories = await getDocumentCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/beneficiaries" className="hover:text-primary transition-colors">
          Beneficiaries
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Documents</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiary Documents</h1>
          <p className="text-muted-foreground">Manage and view documents related to the beneficiary.</p>
        </div>
        <BeneficiarySelector />
      </div>

      {!beneficiaryId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold">No Beneficiary Selected</div>
            <p className="text-muted-foreground">Please select a beneficiary from the dropdown to view their documents.</p>
          </CardContent>
        </Card>
      ) : (
        <DocumentList targetType="BENEFICIARY" entityId={beneficiaryId} documents={documents} categories={categories} />
      )}
    </div>
  )
}
