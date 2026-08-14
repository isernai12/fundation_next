import { Trans } from "@/components/shared/trans";
import { prisma } from "@/lib/prisma"
import { GrantLedgerTable } from "@/features/grants/components/grant-ledger-table"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default async function GrantLedgerPage({ searchParams }: { searchParams: Promise<{ grantId?: string }> }) {
  const resolvedParams = await searchParams
  const { grantId } = resolvedParams

  let grantNumberFilter: string | undefined = undefined
  let specificGrant = null

  if (grantId) {
    specificGrant = await prisma.grant.findUnique({
      where: { id: grantId },
      include: { beneficiary: true }
    })
    if (specificGrant) {
      grantNumberFilter = specificGrant.grantNumber
    }
  }

  const transactions = await prisma.ledgerTransaction.findMany({
    where: {
      type: "GRANT",
      ...(grantNumberFilter ? { referenceId: grantNumberFilter } : {})
    },
    orderBy: { date: 'asc' }, // Ascending to calculate running balance
    include: {
      entries: {
        include: { fund: { include: { group: true } } }
      }
    }
  })

  // Fetch all grants to map beneficiaries if we are viewing all grants
  const grants = await prisma.grant.findMany({ include: { beneficiary: true } })
  const grantMap = new Map(grants.map(g => [g.grantNumber, g]))

  let runningBalance = 0
  const enhancedTransactions = []
  
  // Calculate summary info
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  let totalAmount = 0
  let thisMonthAmount = 0

  for (const t of transactions) {
    const grant = grantMap.get(t.referenceId || "")
    const beneficiaryName = grant?.beneficiary?.fullName || "Unknown"

    let debit = 0
    const credit = 0

    // Grants only debit from the foundation funds
    debit = t.entries.filter(e => e.isCredit).reduce((sum, e) => sum + e.amount, 0)

    runningBalance += debit
    runningBalance -= credit
    totalAmount += debit
    
    if (t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear) {
      thisMonthAmount += debit
    }

    enhancedTransactions.push({
      ...t,
      beneficiaryName,
      debit,
      credit,
      balance: runningBalance
    })
  }

  // Reverse so newest is on top
  enhancedTransactions.reverse()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              <Trans tKey="grants.manage.breadcrumb.finance" /></Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/grants" className="hover:text-primary transition-colors">
              <Trans tKey="grants.ledger.breadcrumb.home" /></Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground"><Trans tKey="grants.ledger.breadcrumb.ledger" /></span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="grants.ledger.pageTitle" />{specificGrant ? ` - ${specificGrant.grantNumber}` : ""}</h1>
              <p className="text-muted-foreground mt-1">
                {specificGrant ? `Ledger for ${specificGrant.beneficiary?.fullName}. Total Grant: ৳${specificGrant.amount}` : <Trans tKey="grants.ledger.subtitle" />}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.totalGrants" /></div>
                <div className="text-2xl font-bold">{transactions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.totalAmount" /></div>
                <div className="text-2xl font-bold text-blue-600">৳{totalAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.currentBalance" /></div>
                <div className="text-2xl font-bold text-orange-600">৳{runningBalance.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1"><Trans tKey="grants.ledger.summary.thisMonth" /></div>
                <div className="text-2xl font-bold text-green-600">৳{thisMonthAmount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <GrantLedgerTable transactions={enhancedTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
