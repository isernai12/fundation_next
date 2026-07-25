import { getDonors } from "@/features/donors/actions"
import { DonorsTable } from "@/features/donors/components/donors-table"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "অনুদানদাতা ব্যবস্থাপনা | Foundation ERP",
  description: "Manage all donors",
}

export default async function ManageDonorsPage() {
  const donors = await getDonors()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">অনুদানদাতা ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">
            প্রতিষ্ঠানের সকল অনুদানদাতার তালিকা ও ব্যবস্থাপনা।
          </p>
        </div>
        <Button asChild>
          <Link href="/donors/new">
            <Plus className="mr-2 h-4 w-4" /> নতুন অনুদানদাতা
          </Link>
        </Button>
      </div>

      <DonorsTable data={donors} />
    </div>
  )
}
