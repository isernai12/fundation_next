import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { getMember } from "@/features/members/actions";
import { settingsApi } from "@/lib/api/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trans } from "@/components/shared/trans";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Dues",
};

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
  
  const [member, defaultFee] = await Promise.all([
    getMember(resolvedParams.id),
    settingsApi.getMonthlyMembershipFee(),
  ]);

  if (!member) return notFound();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const joinDate = member.joinDate ? new Date(member.joinDate) : new Date();
  const monthlyContribution = defaultFee;

  const joinYear = joinDate.getFullYear();
  const joinMonth = joinDate.getMonth() + 1;

  const monthsSinceJoin = Math.max(
    1,
    (currentYear - joinYear) * 12 + (currentMonth - joinMonth) + 1
  );

  const expectedContribution = monthsSinceJoin * monthlyContribution;
  const paidUntilMonth = member.paidUntilMonth || 0;
  const paidUntilYear = member.paidUntilYear || 0;

  let monthsPaid = 0;
  if (paidUntilYear > 0) {
    monthsPaid = Math.max(
      0,
      (paidUntilYear - joinYear) * 12 + (paidUntilMonth - joinMonth) + 1
    );
  }

  const totalPaid = monthsPaid * monthlyContribution;
  const currentDue = Math.max(0, expectedContribution - totalPaid);
  const advanceBalance = Math.max(0, totalPaid - expectedContribution);

  const monthData: any[] = [];
  let tempY = joinYear;
  let tempM = joinMonth;

  let totalDueMonths = 0;
  while (tempY < currentYear || (tempY === currentYear && tempM <= currentMonth)) {
    const isPaid = tempY < paidUntilYear || (tempY === paidUntilYear && tempM <= paidUntilMonth);
    monthData.push({
      month: tempM,
      year: tempY,
      expectedAmount: monthlyContribution,
      status: isPaid ? "পরিশোধিত" : "বকেয়া",
    });
    if (!isPaid) totalDueMonths++;

    tempM++;
    if (tempM > 12) {
      tempM = 1;
      tempY++;
    }
  }

  monthData.reverse();

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-background text-foreground p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/members/manage" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold"><Trans tKey="members.dues.title" /></h1>
        </div>
        <Button asChild>
          <Link href={`/contributions/new?memberId=${member.id}`}>
            <Wallet className="mr-2 h-4 w-4" /> </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3"></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"></td><td className="py-2 font-medium">{member.fullName || 'নাম পাওয়া যায়নি'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"></td><td className="py-2">{member.memberId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"></td><td className="py-2">{member.group?.name || '-'} ({member.group?.code || '-'})</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"></td><td className="py-2">৳ {toBengaliNumerals(monthlyContribution)}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"></td><td className="py-2 text-red-600 font-bold">{toBengaliNumerals(totalDueMonths)} </td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"></td><td className="py-2 text-red-600 font-bold">৳ {toBengaliNumerals(currentDue)}</td></tr>
                {advanceBalance > 0 && (
                  <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"></td><td className="py-2 text-green-600 font-bold">৳ {toBengaliNumerals(advanceBalance)}</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"></h2>
            <div className="rounded-md border bg-card overflow-hidden">
              <table className="w-full text-sm border-collapse text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 font-medium border-b"></th>
                    <th className="py-3 px-4 font-medium border-b"></th>
                    <th className="py-3 px-4 font-medium border-b text-right"></th>
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
  );
}
