import { getDonors } from "@/features/donors/actions"
import { DonorsTable } from "@/features/donors/components/donors-table"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trans } from "@/components/shared/trans";

export const metadata = {
  title: "Donors Management | Foundation ERP",
  description: "Manage all donors",
}

export default async function ManageDonorsPage() {
  const donors = await getDonors()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="donors.manage_page.title" /></h1>
          <p className="text-muted-foreground">
            <Trans tKey="donors.manage_page.subtitle" /></p>
        </div>
        <Button asChild>
          <Link href="/donors/new">
            <Plus className="mr-2 h-4 w-4" /> <Trans tKey="donors.manage_page.new_donor" /></Link>
        </Button>
      </div>

      <DonorsTable data={donors} />
    </div>
  )
}
