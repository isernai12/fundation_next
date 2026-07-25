import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function ContributionLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/contributions" className="hover:text-primary transition-colors">
          মাসিক চাঁদা
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">মাসিক চাঁদা লেজার</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">মাসিক চাঁদা লেজার</h1>
          <p className="text-muted-foreground">মাসিক চাঁদার আর্থিক খতিয়ান এবং ব্যালেন্স।</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold">লেজার মডিউল যুক্ত করা হয়নি</div>
          <p className="text-muted-foreground">লেজার মডিউলটির কাজ বর্তমানে চলমান রয়েছে।</p>
        </CardContent>
      </Card>
    </div>
  )
}
