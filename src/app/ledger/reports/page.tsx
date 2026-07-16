import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, Printer, FileSpreadsheet, FileText, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function LedgerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/ledger" className="hover:text-primary transition-colors">
          Ledger
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Reports</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledger Reports</h1>
          <p className="text-muted-foreground mt-1">Financial statements, fund positions, and cash flows.</p>
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
              <CardTitle className="text-lg">Total Equity</CardTitle>
              <CardDescription>All group funds combined</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Pending Ledger aggregation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">General Fund</CardTitle>
              <CardDescription>Unallocated cash position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Available for use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Outstanding Receivables</CardTitle>
              <CardDescription>Loans & Expected Income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Pending collections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Disbursements</CardTitle>
              <CardDescription>Monthly expense outflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Loans + Grants</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card className="flex flex-col h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg">Cash Flow Statement</CardTitle>
              <CardDescription>Graphical representation of income versus expense</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <Activity className="h-12 w-12 opacity-50" />
                <span>Chart Placeholder</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
