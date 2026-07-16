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
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

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
          Contributions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Due Contributions</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Due Contributions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Members who have not paid their contribution for {new Date().toLocaleString('default', { month: 'long' })} {currentYear}.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Estimated Due</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dueMembers.length ? (
              dueMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName} ({member.memberId})</TableCell>
                  <TableCell>{member.group?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Due
                    </Badge>
                  </TableCell>
                  <TableCell>$50.00</TableCell>
                  <TableCell>
                    <Link href={`/contributions/new?memberId=${member.id}`} className="text-primary hover:underline text-sm font-medium">
                      Collect Now
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  All active members have paid their contributions for this month!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
