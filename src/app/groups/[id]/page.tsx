import { getGroup } from "@/features/groups/actions"
import { getGroupFundSummary } from "@/features/ledger/actions"
import { getDocumentsByEntity, getDocumentCategories } from "@/features/documents/actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, DollarSign, Activity } from "lucide-react"
import { DocumentList } from "@/features/documents/components/document-list"

export default async function GroupDetailsPage({ params }: { params: { id: string } }) {
  const group = await getGroup(params.id)

  if (!group) return notFound()

  const fundSummary = await getGroupFundSummary(params.id)
  const documents = await getDocumentsByEntity("GROUP", params.id)
  const categories = await getDocumentCategories()

  const activeMembers = group.members.filter(m => m.status === "ACTIVE").length
  const inactiveMembers = group.members.filter(m => m.status !== "ACTIVE").length

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground mt-1">
            <span>Code: {group.code}</span>
            <span>&bull;</span>
            <Badge variant={group.status === "ACTIVE" ? "default" : "secondary"}>
              {group.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Group Fund Summary */}
      <h2 className="text-xl font-bold tracking-tight mt-8">Fund Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Fund</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(fundSummary.currentFund / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ledger Balance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(fundSummary.totalContributions / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fundSummary.totalTransactions}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-8">Membership</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group._count.members}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveMembers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold text-sm">Description</span>
            <p className="text-muted-foreground">{group.description || "No description provided."}</p>
          </div>
          <Separator />
          <div>
            <span className="font-semibold text-sm">Created Date</span>
            <p className="text-muted-foreground">{new Date(group.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <DocumentList targetType="GROUP" entityId={group.id} documents={documents} categories={categories} />
    </div>
  )
}
