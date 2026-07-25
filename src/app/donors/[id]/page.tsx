import { getDonor, getDonorLedger } from "@/features/donors/actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/format"
import { DonorProfileActions } from "@/features/donors/components/donor-profile-actions"
import Image from "next/image"
import Link from "next/link"

export default async function DonorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const donor = await getDonor(resolvedParams.id)
  if (!donor) notFound()

  const { ledger } = await getDonorLedger(resolvedParams.id)
  
  // Calculate total and grouping
  const totalDonations = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0
  
  const groupTotals: Record<string, number> = {}
  ledger.forEach(tx => {
    groupTotals[tx.groupName] = (groupTotals[tx.groupName] || 0) + tx.deposit
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{donor.fullName}</h1>
          <p className="text-muted-foreground">অনুদানদাতা আইডি: {donor.donorId}</p>
        </div>
        <DonorProfileActions donorId={donor.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>সাধারণ তথ্য (General Info)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">অবস্থা:</span>
              <span>
                <Badge variant={donor.status === "ACTIVE" ? "default" : "secondary"}>
                  {donor.status === "ACTIVE" ? "সক্রিয়" : donor.status}
                </Badge>
              </span>
              
              <span className="text-muted-foreground">মোবাইল:</span>
              <span>{donor.mobile}</span>

              <span className="text-muted-foreground">জাতীয় পরিচয়পত্র:</span>
              <span>{donor.nationalId || "প্রযোজ্য নয়"}</span>

              <span className="text-muted-foreground">ঠিকানা:</span>
              <span>{donor.address || "প্রযোজ্য নয়"}</span>

              <span className="text-muted-foreground">যোগদানের তারিখ:</span>
              <span>{formatDate(donor.createdAt)}</span>

              <span className="text-muted-foreground">মন্তব্য:</span>
              <span>{donor.notes || "কোনো মন্তব্য নেই"}</span>
            </div>
          </CardContent>
        </Card>

        {donor.documents && donor.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ডকুমেন্টসমূহ (Documents)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {donor.documents.map((doc: any) => (
                  <div key={doc.id} className="border rounded-md p-2 flex flex-col items-center">
                    <p className="text-xs text-muted-foreground mb-2">{doc.title}</p>
                    {doc.type === "IMAGE" ? (
                      <div className="relative w-full h-32">
                        <Image src={doc.secureUrl} alt={doc.title} fill className="object-cover rounded-md" />
                      </div>
                    ) : (
                      <a href={doc.secureUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm">
                        ডাউনলোড করুন
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>অনুদান সারসংক্ষেপ (Donation Summary)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">সর্বমোট অনুদান (Total Donations)</p>
              <p className="text-3xl font-bold text-emerald-600">৳{formatCurrency(totalDonations)}</p>
            </div>
            
            {Object.keys(groupTotals).length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">গ্রুপ ভিত্তিক অনুদান (Donations by Group)</p>
                <div className="space-y-2">
                  {Object.entries(groupTotals).map(([group, amount]) => (
                    <div key={group} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{group}</span>
                      <span className="font-medium">৳{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সর্বশেষ লেনদেন (Recent Transactions)</CardTitle>
          </CardHeader>
          <CardContent>
            {ledger.length > 0 ? (
              <div className="space-y-3">
                {ledger.slice(-5).reverse().map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium">{tx.groupName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                    <div className="font-bold text-emerald-600">
                      +৳{formatCurrency(tx.deposit)}
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 text-center">
                  <Link href={`/donors/ledger?donorId=${donor.id}`} className="text-sm text-primary hover:underline">
                    সম্পূর্ণ লেজার দেখুন →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">কোনো লেনদেন পাওয়া যায়নি</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
