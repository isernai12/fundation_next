import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function GrantLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          অনুদান
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">অনুদান লেজার</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">অনুদান লেজার</h1>
          <p className="text-muted-foreground mt-1">সব অনুদানের আর্থিক লেজার এন্ট্রি এবং ব্যালেন্স।</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <div className="text-xl font-semibold">লেজার ইন্টিগ্রেশন চলমান</div>
          <p className="text-muted-foreground max-w-md text-center">
            ডেডিকেটেড লেজার মডিউলটি বর্তমানে ডেভেলপমেন্ট পর্যায়ে রয়েছে।
            যাইহোক, অনুদান দ্বারা সৃষ্ট সব আর্থিক লেনদেন ইতোমধ্যেই ডুয়েল-এন্ট্রি অ্যাকাউন্টিং মান অনুযায়ী ব্যাকগ্রাউন্ড ডাটাবেসে সুরক্ষিতভাবে সংরক্ষিত হচ্ছে।
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
