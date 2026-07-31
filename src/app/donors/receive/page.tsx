import { DonationForm } from "@/features/donors/components/donation-form"
import { getDonors } from "@/features/donors/actions"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export const metadata = {
  title: "Receive Donation | Foundation ERP",
}

export default async function ReceiveDonationPage() {
  const donors = await getDonors()
  const groups = await prisma.group.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/donors/manage" className="hover:text-primary transition-colors">
          <Trans tKey="donors.receive_page.breadcrumb_donors" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="donors.receive_page.breadcrumb_receive" /></span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="donors.receive_page.title" /></h1>
          <p className="text-muted-foreground">
            <Trans tKey="donors.receive_page.subtitle" /></p>
        </div>
      </div>

      <DonationForm 
        donors={donors.map(d => ({
          id: d.id,
          fullName: d.fullName,
          donorId: d.donorId,
          mobile: d.mobile
        }))} 
        groups={groups.map(g => ({
          id: g.id,
          name: g.name
        }))} 
      />
    </div>
  )
}
