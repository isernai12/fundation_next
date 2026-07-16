import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function GrantDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          Grants
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Grant Documents</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grant Documents</h1>
          <p className="text-muted-foreground mt-1">Manage applications, medical reports, NIDs, and other attachments.</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <FolderOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold">Document Vault</div>
          <p className="text-muted-foreground max-w-md text-center">
            The document vault is currently being integrated with cloud storage.
            Uploads for Grants will be available shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
