import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Download, Printer, FileSpreadsheet, FileText, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Trans } from "@/components/shared/trans";

export default function GrantReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/grants" className="hover:text-primary transition-colors">
          <Trans tKey="app.text" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="app.text" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app.text" /></h1>
          <p className="text-muted-foreground mt-1"><Trans tKey="app.text" /></p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end items-center space-x-2">
          <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" /> <Trans tKey="app.text" /></Button>
          <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4" /> <Trans tKey="app.pdf" /></Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="mr-2 h-4 w-4" /> <Trans tKey="app.excel" /></Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> <Trans tKey="app.csv" /></Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg"><Trans tKey="app.text" /></CardTitle>
              <CardDescription><Trans tKey="app.text" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><Trans tKey="app.text" /></div>
              <p className="text-xs text-muted-foreground mt-1"><Trans tKey="app.text" /></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg"><Trans tKey="app.text" /></CardTitle>
              <CardDescription><Trans tKey="app.text" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">০</div>
              <p className="text-xs text-muted-foreground mt-1"><Trans tKey="app.text" /></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg"><Trans tKey="app.text" /></CardTitle>
              <CardDescription><Trans tKey="app.text" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">০</div>
              <p className="text-xs text-muted-foreground mt-1"><Trans tKey="app.text" /></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg"><Trans tKey="app.text" /></CardTitle>
              <CardDescription><Trans tKey="app.text" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary"><Trans tKey="app.text" /></div>
              <p className="text-xs text-muted-foreground mt-1"><Trans tKey="app.text" /></p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-lg"><Trans tKey="app.text" /></CardTitle>
              <CardDescription><Trans tKey="app.text" /></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <PieChart className="h-12 w-12 opacity-50" />
                <span><Trans tKey="app.text" /></span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-lg"><Trans tKey="app.text" /></CardTitle>
              <CardDescription><Trans tKey="app.text" /></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-12 w-12 opacity-50" />
                <span><Trans tKey="app.text" /></span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
