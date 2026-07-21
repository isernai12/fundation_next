import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Download, Printer, FileSpreadsheet, FileText, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function GrantReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          অনুদান
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">রিপোর্ট</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">অনুদান রিপোর্ট</h1>
          <p className="text-muted-foreground mt-1">প্রদত্ত অনুদানের বিশ্লেষণ এবং সামগ্রিক রিপোর্ট।</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end items-center space-x-2">
          <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" /> প্রিন্ট</Button>
          <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> পিডিএফ (PDF)</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="mr-2 h-4 w-4" /> এক্সেল (Excel)</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> সিএসভি (CSV)</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">মোট প্রদত্ত অনুদান</CardTitle>
              <CardDescription>শুরু থেকে এ পর্যন্ত</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳০.০০</div>
              <p className="text-xs text-muted-foreground mt-1">০ টি অনুদানে</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">মোট অনুদান সংখ্যা</CardTitle>
              <CardDescription>সর্বমোট অনুমোদিত অনুদান</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">০</div>
              <p className="text-xs text-muted-foreground mt-1">১০০% সফল</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">সুবিধাভোগী</CardTitle>
              <CardDescription>অনন্য গ্রহীতা</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">০</div>
              <p className="text-xs text-muted-foreground mt-1">গড়ে ৳০ প্রতি জন</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">মাসিক প্রবণতা</CardTitle>
              <CardDescription>গত মাসের তুলনায়</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">০%</div>
              <p className="text-xs text-muted-foreground mt-1">সহায়তা বৃদ্ধি</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-lg">ফান্ডিং গ্রুপ অনুসারে অনুদান</CardTitle>
              <CardDescription>কোন গ্রুপ থেকে কত অনুদান দেওয়া হয়েছে</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <PieChart className="h-12 w-12 opacity-50" />
                <span>চার্ট প্লেসহোল্ডার</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-lg">মাসিক অনুদান প্রদান</CardTitle>
              <CardDescription>গত ৬ মাসের অনুদান</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-12 w-12 opacity-50" />
                <span>চার্ট প্লেসহোল্ডার</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
