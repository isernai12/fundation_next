import { DonationForm } from "@/features/donors/components/donation-form"
import { getDonors } from "@/features/donors/actions"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "অনুদান গ্রহণ | Foundation ERP",
}

export default async function ReceiveDonationPage() {
  const donors = await getDonors()
  const groups = await prisma.group.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/donors/manage" className="hover:text-primary transition-colors">
          অনুদানদাতা
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">অনুদান গ্রহণ</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">অনুদান গ্রহণ</h1>
          <p className="text-muted-foreground">
            অনুদানদাতার কাছ থেকে সাধারণ তহবিল অথবা নির্দিষ্ট কার্যক্রমে অনুদান রেকর্ড করুন।
          </p>
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
