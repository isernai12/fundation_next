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
export default async function ManageCampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          তহবিল কার্যক্রম
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">ব্যবস্থাপনা</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">তহবিল কার্যক্রম ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সকল তহবিল কার্যক্রম এবং ক্যাম্পেইনের তালিকা ও স্ট্যাটাস।</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> নতুন কার্যক্রম
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>কার্যক্রমের নাম</TableHead>
              <TableHead>উদ্দেশ্য</TableHead>
              <TableHead>লক্ষ্যমাত্রা</TableHead>
              <TableHead>সংগৃহীত</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead className="text-right">অ্যাকশন</TableHead>
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
                    <TableCell>{campaign.targetAmount ? `৳${campaign.targetAmount}` : 'অনির্ধারিত'}</TableCell>
                    <TableCell>৳{totalCollected}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"}>
                        {campaign.status === "ACTIVE" ? "চলমান" : campaign.status === "COMPLETED" ? "সম্পন্ন" : "বাতিল"}
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
                          <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/${campaign.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/ledger?campaignId=${campaign.id}`}>
                              <FileText className="mr-2 h-4 w-4" /> তহবিল লেজার
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/campaigns/${campaign.id}/transactions`}>
                              <History className="mr-2 h-4 w-4" /> লেনদেন ইতিহাস
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Printer className="mr-2 h-4 w-4" /> প্রিন্ট
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle className="mr-2 h-4 w-4" /> সম্পন্ন/বন্ধ করুন
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" /> মুছে ফেলুন
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  কোনো তহবিল কার্যক্রম পাওয়া যায়নি
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
