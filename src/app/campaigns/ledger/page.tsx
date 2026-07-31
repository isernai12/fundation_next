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
          <Trans tKey="app.text" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="app.text" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="app.text" /></h1>
          <p className="text-muted-foreground"><Trans tKey="app.text" /></p>
        </div>
        <div className="flex gap-2">
          {campaign && (
            <>
              <Button variant="outline"><Printer className="mr-2 w-4 h-4" /> <Trans tKey="app.text" /></Button>
              <Button variant="outline"><Download className="mr-2 w-4 h-4" /> <Trans tKey="app.text" /></Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 font-medium text-lg"><Trans tKey="app.text" /></div>
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
            <div className="text-xl font-semibold"><Trans tKey="app.text" /></div>
            <p className="text-muted-foreground"><Trans tKey="app.text" /></p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="app.text" /></CardTitle>
                <HandHeart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{campaign.contributions.reduce((sum, c) => sum + c.amount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Trans tKey="app.text" />{campaign.targetAmount ? `৳${campaign.targetAmount}` : "অনির্ধারিত"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="app.text" /></CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{campaign.contributions.filter(c => c.memberId).reduce((sum, c) => sum + c.amount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="app.text" /></CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{campaign.contributions.filter(c => c.donorId).reduce((sum, c) => sum + c.amount, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><Trans tKey="app.text" /></CardTitle>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{campaign.contributions.reduce((sum, c) => sum + c.amount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Trans tKey="app.text" />{campaign.contributions.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle><Trans tKey="app.ledger" /></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Trans tKey="app.text" /></TableHead>
                      <TableHead><Trans tKey="app.text" /></TableHead>
                      <TableHead><Trans tKey="app.text" /></TableHead>
                      <TableHead><Trans tKey="app.text" /></TableHead>
                      <TableHead><Trans tKey="app.text" /></TableHead>
                      <TableHead className="text-right"><Trans tKey="app.text" /></TableHead>
                      <TableHead className="text-right"><Trans tKey="app.text" /></TableHead>
                      <TableHead className="text-right"><Trans tKey="app.text" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // We need to calculate running balance. Sort by date ascending to calculate, then reverse to display newest first
                      const sorted = [...campaign.contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      let balance = 0;
                      const withBalance = sorted.map(c => {
                        balance += c.amount;
                        return { ...c, runningBalance: balance }
                      });
                      
                      const displayData = withBalance.reverse();

                      return displayData.length > 0 ? displayData.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{formatDateBanglaLocal(c.date)}</TableCell>
                          <TableCell className="font-mono text-xs">{c.ledgerTransactionId.slice(0, 8)}</TableCell>
                          <TableCell>
                            {c.member ? c.member.fullName : c.donor ? c.donor.fullName : "অজানা"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.memberId ? "default" : "secondary"}>
                              {c.memberId ? "সদস্য" : "ডোনার"}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.remarks || "তহবিলে জমা"}</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">৳{c.amount}</TableCell>
                          <TableCell className="text-right font-bold">৳{c.runningBalance}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                            <Trans tKey="app.text" /></TableCell>
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
