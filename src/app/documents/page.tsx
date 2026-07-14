import { getAllDocuments, getDocumentCategories } from "@/features/documents/actions"
import { DocumentsTable } from "@/features/documents/components/documents-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function DocumentsPage() {
  const documents = await getAllDocuments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Global repository of all uploaded documents.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/documents/categories"><Settings className="mr-2 h-4 w-4" /> Manage Categories</Link>
        </Button>
      </div>

      <DocumentsTable data={documents} />
    </div>
  )
}
