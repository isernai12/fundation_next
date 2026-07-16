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
          Grants
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Reports</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grant Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and comprehensive reports on dispersed grants.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end items-center space-x-2">
          <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" /> Print</Button>
          <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> CSV</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Disbursed</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Across 0 grants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Category</CardTitle>
              <CardDescription>Most funded purpose</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Medical</div>
              <p className="text-xs text-muted-foreground mt-1">0% of total grants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Beneficiaries</CardTitle>
              <CardDescription>Unique recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Average $0 per person</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly Trend</CardTitle>
              <CardDescription>Compared to last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0%</div>
              <p className="text-xs text-muted-foreground mt-1">Growth in assistance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-lg">Grants by Category</CardTitle>
              <CardDescription>Distribution across purposes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <PieChart className="h-12 w-12 opacity-50" />
                <span>Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-lg">Funding by Group</CardTitle>
              <CardDescription>Which groups contribute the most</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-12 w-12 opacity-50" />
                <span>Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
