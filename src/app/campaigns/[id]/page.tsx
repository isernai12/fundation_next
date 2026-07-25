import { getCampaign } from "@/features/campaigns/actions"
import Link from "next/link"
import { ChevronRight, Target, Users, Landmark, FileText, Calendar, Wallet } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const campaign = await getCampaign(resolvedParams.id)
  
  if (!campaign) {
    notFound()
  }

  const memberContributions = campaign.contributions.filter(c => c.memberId)
  const donorContributions = campaign.contributions.filter(c => c.donorId)
  
  const totalMemberCollected = memberContributions.reduce((sum, c) => sum + c.amount, 0)
  const totalDonorCollected = donorContributions.reduce((sum, c) => sum + c.amount, 0)
  const totalCollected = totalMemberCollected + totalDonorCollected

  const remainingAmount = campaign.targetAmount ? Math.max(0, campaign.targetAmount - totalCollected) : null
  const progress = campaign.targetAmount ? Math.min(100, Math.round((totalCollected / campaign.targetAmount) * 100)) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          তহবিল কার্যক্রম
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{campaign.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Target className="h-4 w-4" /> {campaign.purpose}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"} className="text-sm px-3 py-1">
            {campaign.status === "ACTIVE" ? "চলমান" : campaign.status === "COMPLETED" ? "সম্পন্ন" : "বাতিল"}
          </Badge>
          <Link href={`/campaigns/${campaign.id}/contribute`}>
            <Button>তহবিল সংগ্রহ</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Wallet className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-medium text-muted-foreground">সর্বমোট সংগৃহীত</p>
            <h2 className="text-2xl font-bold text-primary">৳{totalCollected}</h2>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Target className="h-8 w-8 text-orange-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">লক্ষ্যমাত্রা</p>
            <h2 className="text-2xl font-bold">{campaign.targetAmount ? `৳${campaign.targetAmount}` : 'অনির্ধারিত'}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Target className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">অবশিষ্ট (Remaining)</p>
            <h2 className="text-2xl font-bold">{remainingAmount !== null ? `৳${remainingAmount}` : '-'}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">সদস্যদের অবদান</p>
            <h2 className="text-2xl font-bold">৳{totalMemberCollected}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-center items-center text-center space-y-2">
            <Landmark className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">অনুদানদাতাদের অবদান</p>
            <h2 className="text-2xl font-bold">৳{totalDonorCollected}</h2>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
          <TabsTrigger value="contributions">তহবিল প্রাপ্তি ({campaign.contributions.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">কার্যক্রমের তথ্যাবলী</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">কার্যক্রম আইডি</p>
                  <p className="font-medium">{campaign.campaignId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">শুরুর তারিখ</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(campaign.startDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">শেষের তারিখ</p>
                  <p className="font-medium flex items-center gap-1">
                    {campaign.endDate ? (
                      <>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(campaign.endDate), "PPP")}
                      </>
                    ) : 'অনির্ধারিত'}
                  </p>
                </div>
              </div>
              
              {campaign.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <FileText className="h-4 w-4" /> বিস্তারিত বিবরণ
                  </p>
                  <p className="text-sm leading-relaxed">{campaign.description}</p>
                </div>
              )}
              {campaign.remarks && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">মন্তব্য</p>
                  <p className="text-sm">{campaign.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">তহবিল প্রাপ্তির তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রদানকারী</TableHead>
                      <TableHead>ধরন</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>মন্তব্য</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.contributions.length ? (
                      campaign.contributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>{format(new Date(contribution.date), "dd MMM, yyyy")}</TableCell>
                          <TableCell className="font-medium">
                            {contribution.member ? (
                              <Link href={`/members/${contribution.member.id}`} className="hover:underline text-primary">
                                {contribution.member.fullName || 'সদস্য'} ({contribution.member.memberId})
                              </Link>
                            ) : contribution.donor ? (
                              <Link href={`/donors/${contribution.donor.id}`} className="hover:underline text-primary">
                                {contribution.donor.fullName} ({contribution.donor.donorId})
                              </Link>
                            ) : (
                              'অজানা'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {contribution.memberId ? 'সদস্য' : 'অনুদানদাতা'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold">৳{contribution.amount}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{contribution.remarks || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          এখনও কোনো তহবিল পাওয়া যায়নি
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
