import { getReceivedDonations, getDonors } from "@/features/donors/actions"
import { prisma } from "@/lib/prisma"
import { DonorLedgerClient } from "@/features/donors/components/donor-ledger-client"
import Link from "next/link"
import { ChevronRight, FileSpreadsheet } from "lucide-react"

export const metadata = {
  title: "অনুদানদাতার লেজার | Foundation ERP",
  description: "Master Ledger for all Donor transactions",
}

export default async function DonorLedgerPage() {
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
      <div className="flex items-center space-x-2 text-sm text-muted-foreground hide-print">
        <Link href="/donors/manage" className="hover:text-primary transition-colors">
          অনুদানদাতা
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">অনুদানদাতার লেজার</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 hide-print">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">অনুদানদাতার লেজার (Master Ledger)</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            ফাউন্ডেশনের সকল অনুদান লেনদেনের বিস্তারিত লেজার, ফিল্টারিং ও এক্সপোর্ট সুবিধা।
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
        groups={groups.map(g => ({
          id: g.id,
          name: g.name,
        }))}
      />
    </div>
  )
}
