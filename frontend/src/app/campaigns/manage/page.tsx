import { getCampaigns } from "@/features/campaigns/actions"
import Link from "next/link"
import { ChevronRight, Plus, Eye, MoreHorizontal, Edit, FileText, History, Printer, CheckCircle, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trans } from "@/components/shared/trans";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sadaqah Management",
};

export default async function ManageCampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          <Trans tKey="campaigns.manage.breadcrumb.home" /></Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground"><Trans tKey="campaigns.manage.breadcrumb.manage" /></span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="campaigns.manage.pageTitle" /></h1>
          <p className="text-muted-foreground"><Trans tKey="campaigns.manage.subtitle" /></p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.newActivity" /></Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Trans tKey="campaigns.manage.table.name" /></TableHead>
              <TableHead><Trans tKey="campaigns.manage.table.purpose" /></TableHead>
              <TableHead><Trans tKey="campaigns.manage.table.targetAmount" /></TableHead>
              <TableHead><Trans tKey="campaigns.manage.table.collectedAmount" /></TableHead>
              <TableHead><Trans tKey="campaigns.manage.table.status" /></TableHead>
              <TableHead className="text-right"><Trans tKey="campaigns.manage.table.actions" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length ? (
              campaigns.map((campaign) => {
                const totalCollected = campaign.contributions.reduce((sum, c) => sum + c.amount, 0)
                
                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.purpose}</TableCell>
                    <TableCell>{campaign.targetAmount ? `৳${campaign.targetAmount}` : <Trans tKey="campaigns.manage.table.notSet" />}</TableCell>
                    <TableCell>৳{totalCollected}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"}>
                        {campaign.status === "ACTIVE" ? <Trans tKey="campaigns.manage.status.active" /> : campaign.status === "COMPLETED" ? <Trans tKey="campaigns.manage.status.completed" /> : <Trans tKey="campaigns.manage.status.cancelled" />}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel><Trans tKey="campaigns.manage.actions.menu" /></DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.view" /></Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/${campaign.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.edit" /></Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/ledger?campaignId=${campaign.id}`}>
                              <FileText className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.ledger" /></Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/${campaign.id}/transactions`}>
                              <History className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.transactions" /></Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Printer className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.print" /></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.complete" /></DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" /> <Trans tKey="campaigns.manage.actions.delete" /></DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  <Trans tKey="campaigns.manage.table.empty" /></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
