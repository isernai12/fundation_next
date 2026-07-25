import { getReceivedDonations, getDonors } from "@/features/donors/actions"
import { DonationsTable } from "@/features/donors/components/donations-table"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ChevronRight, Plus, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "অনুদান গ্রহণ ব্যবস্থাপনা | Foundation ERP",
  description: "Manage all received donation transactions, print receipts, and synchronize ledgers.",
}

export default async function ReceivedDonationsPage() {
  const [donations, donors, groups] = await Promise.all([
    getReceivedDonations(),
    getDonors(),
    prisma.group.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/donors/manage" className="hover:text-primary transition-colors">
          অনুদানদাতা
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">অনুদান গ্রহণ ব্যবস্থাপনা</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">অনুদান গ্রহণ ব্যবস্থাপনা</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            পূর্বে গৃহীত সকল অনুদান লেনদেনের ব্যবস্থাপনা, রিসিট প্রিন্ট ও লেজার অনুসন্ধান করুন। (Ledger Synchronized)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="shadow-sm">
            <Link href="/donors/receive">
              <Plus className="mr-2 h-4 w-4" /> নতুন অনুদান গ্রহণ
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Table */}
      <DonationsTable
        data={donations}
        donors={donors.map(d => ({
          id: d.id,
          fullName: d.fullName,
          donorId: d.donorId,
          mobile: d.mobile,
        }))}
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
        }))}
      />
    </div>
  )
}
