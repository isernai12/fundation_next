import { getDocumentCategories } from "@/features/documents/actions"
import { CategoryFormDialog } from "@/features/documents/components/category-form-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Tag } from "lucide-react"

export default async function DocumentCategoriesPage() {
  const categories = await getDocumentCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Categories</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage reusable categories for document classification.
            </p>
          </div>
          <CategoryFormDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(category => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base truncate" title={category.name}>{category.name}</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2" title={category.description || ""}>
                {category.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No categories defined yet.
          </div>
        )}
      </div>
    </div>
  )
}
