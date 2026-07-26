import { getNow } from "@/lib/date";
import { formatMonth } from "@/lib/format"
import { getMembers } from "@/features/members/actions"
import { getContributions } from "@/features/contributions/actions"
import Link from "next/link"
import { ChevronRight, AlertCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function DueContributionsPage() {
  const members = await getMembers()
  const contributions = await getContributions()
  
  const currentMonth = getNow().getMonth() + 1
  const currentYear = getNow().getFullYear()

  // Determine who has paid this month
  const paidMemberIds = new Set(
    contributions
      .filter(c => c.month === currentMonth && c.year === currentYear && c.status === "PAID")
      .map(c => c.memberId)
  )

  const dueMembers = members.filter(m => !paidMemberIds.has(m.id) && m.status === "ACTIVE")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          মাসিক চাঁদা
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">বকেয়া চাঁদা</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">বকেয়া চাঁদা</h1>
          <p className="text-muted-foreground text-sm mt-1">
            যে সকল সদস্য {formatMonth(getNow().getMonth())} {currentYear} এর চাঁদা পরিশোধ করেননি।
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>সদস্য</TableHead>
              <TableHead>গ্রুপ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>বকেয়া পরিমাণ</TableHead>
              <TableHead>অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dueMembers.length ? (
              dueMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName || 'নাম পাওয়া যায়নি'} ({member.memberId})</TableCell>
                  <TableCell>{member.group?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> বকেয়া
                    </Badge>
                  </TableCell>
                  <TableCell>৳১০০.০০</TableCell>
                  <TableCell>
                    <Link href={`/contributions/new?memberId=${member.id}`} className="text-primary hover:underline text-sm font-medium">
                      চাঁদা নিন
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  এই মাসের জন্য সকল সক্রিয় সদস্য তাদের চাঁদা পরিশোধ করেছেন!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
