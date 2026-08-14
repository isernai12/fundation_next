import { DonationForm } from "@/features/donors/components/donation-form"
import { getDonors } from "@/features/donors/actions"
import { getMembers } from "@/features/members/actions"
import { getGroups } from "@/features/groups/actions"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Receive Donation | Foundation ERP",
}

export default async function ReceiveDonationPage() {
  const [donors, members, groups] = await Promise.all([
    getDonors(),
    getMembers(),
    getGroups(),
  ])

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
        members={members.map(m => ({
          id: m.id,
          memberId: m.memberId,
          fullName: m.fullName,
          group: m.group,
          status: m.status
        }))}
        groups={groups.map(g => ({
          id: g.id,
          name: g.name
        }))} 
      />
    </div>
  )
}
