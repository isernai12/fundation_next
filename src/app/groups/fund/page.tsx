import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Group Fund</h1>
        <p className="text-muted-foreground">View financial summaries and balances for each group.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  )
}
