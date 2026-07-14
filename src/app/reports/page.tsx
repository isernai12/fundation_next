import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building, Users, PiggyBank, Gift, BookOpen, FileText, Activity } from "lucide-react"

const reportCategories = [
  {
    title: "Foundation Reports",
    icon: Building,
    reports: [
      { name: "Foundation Summary", href: "/reports/foundation/summary" },
      { name: "Income & Expense", href: "/reports/foundation/income-expense" },
      { name: "Fund Position", href: "/reports/foundation/fund-position" },
    ]
  },
  {
    title: "Group Reports",
    icon: Activity,
    reports: [
      { name: "Current Fund Balances", href: "/reports/groups/fund-balances" },
      { name: "Contribution Summary", href: "/reports/groups/contributions" },
    ]
  },
  {
    title: "Member Reports",
    icon: Users,
    reports: [
      { name: "Member Directory", href: "/reports/members/directory" },
      { name: "Due Report", href: "/reports/members/dues" },
    ]
  },
  {
    title: "Loan & Grant Reports",
    icon: PiggyBank,
    reports: [
      { name: "Loan Register", href: "/reports/loans/register" },
      { name: "Overdue Loans", href: "/reports/loans/overdue" },
      { name: "Grant Register", href: "/reports/grants/register" },
    ]
  },
  {
    title: "Ledger Reports",
    icon: BookOpen,
    reports: [
      { name: "General Ledger", href: "/reports/ledger/general" },
      { name: "Transaction Register", href: "/reports/ledger/transactions" },
    ]
  },
  {
    title: "Document Reports",
    icon: FileText,
    reports: [
      { name: "Uploaded Documents", href: "/reports/documents/all" },
    ]
  }
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Access all system reports. Data is generated dynamically from the ledger.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="flex flex-row items-center space-x-2 pb-2 border-b">
              <category.icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {category.reports.map((report) => (
                  <li key={report.name}>
                    <Link href={report.href} className="text-sm text-blue-600 hover:underline">
                      {report.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
