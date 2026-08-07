import { getReceivedDonations, getDonors } from "@/features/donors/actions"
import { getMembers } from "@/features/members/actions"
import { prisma } from "@/lib/prisma"
import { DonorLedgerClient } from "@/features/donors/components/donor-ledger-client"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight, FileSpreadsheet } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export const metadata = {
  title: "Donor Ledger | Foundation ERP",
  description: "Master Ledger for all Donor transactions",
}

export default async function DonorLedgerPage() {
  const [donations, donors, members, groups] = await Promise.all([
    getReceivedDonations(),
    getDonors(),
    getMembers(),
    prisma.group.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/donors" className="hover:text-primary transition-colors">
          <Trans tKey="donors.ledger_page.breadcrumb_donors" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="donors.ledger_page.breadcrumb_ledger" /></span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 hide-print">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="donors.ledger_page.title" /></h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            <Trans tKey="donors.ledger_page.subtitle" />
          </p>
        </div>
      </div>

      <DonorLedgerClient 
        data={donations}
        donors={donors.map(d => ({
          id: d.id,
          fullName: d.fullName,
          donorId: d.donorId,
          mobile: d.mobile,
        }))}
        members={members.map(m => ({
          id: m.id,
          memberId: m.memberId,
          fullName: m.fullName,
          group: m.group,
          status: m.status,
        }))}
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
        }))}
      />
    </div>
  )
}
