import { formatDate } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Wallet } from "lucide-react"
import { generateMissingContributions } from "@/features/members/due-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const monthNames = [
  "জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

function getBengaliMonth(monthNumber: number) {
  return monthNames[monthNumber - 1] || "";
}

function toBengaliNumerals(num: number | string) {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d)]);
}

export default async function DueDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Ensure contributions are up to date
  await generateMissingContributions();
  
  const member = await prisma.member.findUnique({
    where: { id: resolvedParams.id },
    include: {
      group: true,
      contributions: {
        include: { payments: true }
      }
    }
  });

  if (!member) return notFound();

  let expectedContribution = 0;
  let totalPaid = 0;
  let monthlyContribution = 0;

  // The most recent default contribution
  const regularConts = member.contributions.filter(c => !c.isAdditional).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  if (regularConts.length > 0) {
    monthlyContribution = regularConts[0].expectedAmount;
  }

  // Calculate totals
  member.contributions.forEach(cont => {
    if (!cont.isAdditional) {
      expectedContribution += cont.expectedAmount;
    }
    cont.payments.forEach(payment => {
      totalPaid += payment.amount;
    });
  });

  let currentDue = expectedContribution - totalPaid;
  let advanceBalance = 0;

  if (currentDue < 0) {
    advanceBalance = Math.abs(currentDue);
    currentDue = 0;
  }

  // Distribute totalPaid chronologically
  let remainingTotalPaid = totalPaid;
  
  const chronologicalMonths = [...regularConts].reverse(); // oldest first
  const monthData = [];
  
  let totalDueMonths = 0;

  for (const month of chronologicalMonths) {
    if (remainingTotalPaid >= month.expectedAmount) {
      monthData.push({ ...month, status: 'পরিশোধিত' });
      remainingTotalPaid -= month.expectedAmount;
    } else {
      monthData.push({ ...month, status: 'বকেয়া' });
      totalDueMonths++;
      // We don't deduct partial amounts to keep things simple as "বকেয়া" or "পরিশোধিত"
    }
  }

  // Reverse back to newest first for display
  monthData.reverse();

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-white text-black p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/members/manage" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">চাঁদার তথ্য</h1>
        </div>
        <Button asChild>
          <Link href={`/contributions/new?memberId=${member.id}`}>
            <Wallet className="mr-2 h-4 w-4" /> চাঁদা গ্রহণ করুন
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3">সারসংক্ষেপ</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">সদস্যের নাম</td><td className="py-2 font-medium">{member.fullName || 'নাম পাওয়া যায়নি'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">সদস্য আইডি</td><td className="py-2">{member.memberId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">গ্রুপ</td><td className="py-2">{member.group?.name || '-'} ({member.group?.code || '-'})</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মাসিক চাঁদার পরিমাণ</td><td className="py-2">৳ {toBengaliNumerals(monthlyContribution)}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মোট বকেয়া মাস</td><td className="py-2 text-red-600 font-bold">{toBengaliNumerals(totalDueMonths)} মাস</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মোট বকেয়া টাকা</td><td className="py-2 text-red-600 font-bold">৳ {toBengaliNumerals(currentDue)}</td></tr>
                {advanceBalance > 0 && (
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">অগ্রিম জমা</td><td className="py-2 text-green-600 font-bold">৳ {toBengaliNumerals(advanceBalance)}</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">মাসভিত্তিক বিবরণ</h2>
            <div className="rounded-md border bg-card overflow-hidden">
              <table className="w-full text-sm border-collapse text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-medium border-b">মাস</th>
                    <th className="py-3 px-4 font-medium border-b">নির্ধারিত চাঁদা</th>
                    <th className="py-3 px-4 font-medium border-b text-right">অবস্থা</th>
                  </tr>
                </thead>
                <tbody>
                  {monthData.map((data, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {getBengaliMonth(data.month)} {toBengaliNumerals(data.year)}
                      </td>
                      <td className="py-3 px-4">
                        ৳ {toBengaliNumerals(data.expectedAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={data.status === 'পরিশোধিত' ? 'default' : 'destructive'} className="font-normal">
                          {data.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {monthData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground">
                        কোনো তথ্য পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
