import { getNow, formatDate , formatDateBanglaLocal} from "@/lib/date";
import { getCampaigns, getCampaign } from "@/features/campaigns/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ChevronRight, Download, Printer, Filter, ReceiptText, Users, HandHeart } from "lucide-react"
import Link from "next/link"
import { CampaignSelector } from "@/features/campaigns/components/campaign-selector"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trans } from "@/components/shared/trans";

export default async function CampaignLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>
}) {
  const campaigns = await getCampaigns()
  const resolvedParams = await searchParams
  const campaignId = resolvedParams.campaignId
  const campaign = campaignId ? await getCampaign(campaignId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          <Trans tKey="campaigns.ledger.breadcrumb.manage" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="campaigns.ledger.breadcrumb.ledger" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="campaigns.ledger.pageTitle" /></h1>
          <p className="text-muted-foreground"><Trans tKey="campaigns.ledger.subtitle" /></p>
        </div>
        <div className="flex gap-2">
          {campaign && (
            <>
              <Button variant="outline"><Printer className="mr-2 w-4 h-4" /> <Trans tKey="campaigns.ledger.print" /></Button>
              <Button variant="outline"><Download className="mr-2 w-4 h-4" /> <Trans tKey="campaigns.ledger.download" /></Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 font-medium text-lg"><Trans tKey="campaigns.ledger.selectActivity" /></div>
            <div className="flex-2 w-full sm:w-auto">
              <CampaignSelector 
                campaigns={campaigns.map(c => ({ id: c.id, name: c.name }))} 
                selectedCampaignId={campaignId} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!campaign ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4 pt-6">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-semibold"><Trans tKey="campaigns.ledger.emptyTitle" /></div>
            <p className="text-muted-foreground"><Trans tKey="campaigns.ledger.emptySubtitle" /></p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collected Amount</CardTitle>
                <HandHeart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ৳{campaign.contributions.reduce((sum, c) => sum + c.amount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Trans tKey="campaigns.ledger.summary.target" />{campaign.targetAmount ? `৳${campaign.targetAmount}` : <Trans tKey="campaigns.manage.table.notSet" />}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beneficiary Payments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  ৳{campaign.beneficiaryPayments.reduce((sum, p) => sum + p.amount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ৳{campaign.contributions.reduce((sum, c) => sum + c.amount, 0) - campaign.beneficiaryPayments.reduce((sum, p) => sum + p.amount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.contributions.length + campaign.beneficiaryPayments.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle><Trans tKey="campaigns.ledger.table.title" /></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Trans tKey="campaigns.ledger.table.date" /></TableHead>
                      <TableHead><Trans tKey="campaigns.ledger.table.trxId" /></TableHead>
                      <TableHead><Trans tKey="campaigns.ledger.table.contributor" /></TableHead>
                      <TableHead><Trans tKey="campaigns.ledger.table.type" /></TableHead>
                      <TableHead><Trans tKey="campaigns.ledger.table.remarks" /></TableHead>
                      <TableHead className="text-right"><Trans tKey="campaigns.ledger.table.debit" /></TableHead>
                      <TableHead className="text-right"><Trans tKey="campaigns.ledger.table.credit" /></TableHead>
                      <TableHead className="text-right"><Trans tKey="campaigns.ledger.table.balance" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Combine and sort by date ascending
                      const combined = [
                        ...campaign.contributions.map(c => ({
                          ...c,
                          isCredit: true,
                          party: c.member ? c.member.fullName : (c.donor ? c.donor.fullName : "Unknown"),
                          type: c.memberId ? "Member Contribution" : "Donor Contribution",
                          remarks: c.remarks || "Deposit"
                        })),
                        ...campaign.beneficiaryPayments.map(p => ({
                          ...p,
                          isCredit: false,
                          party: p.beneficiary.fullName,
                          type: "Beneficiary Payment",
                          remarks: p.reason
                        }))
                      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                      let balance = 0;
                      const withBalance = combined.map(c => {
                        if (c.isCredit) {
                          balance += c.amount;
                        } else {
                          balance -= c.amount;
                        }
                        return { ...c, runningBalance: balance }
                      });
                      
                      const displayData = withBalance.reverse();

                      return displayData.length > 0 ? displayData.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{formatDateBanglaLocal(c.date)}</TableCell>
                          <TableCell className="font-mono text-xs">{c.ledgerTransactionId.slice(0, 8)}</TableCell>
                          <TableCell>{c.party}</TableCell>
                          <TableCell>
                            <Badge variant={c.isCredit ? "default" : "destructive"}>
                              {c.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.remarks}</TableCell>
                          <TableCell className="text-right text-red-500 font-medium">{!c.isCredit ? `৳${c.amount}` : '-'}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">{c.isCredit ? `৳${c.amount}` : '-'}</TableCell>
                          <TableCell className="text-right font-bold">৳{c.runningBalance}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                            <Trans tKey="campaigns.ledger.table.empty" /></TableCell>
                        </TableRow>
                      )
                    })()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
