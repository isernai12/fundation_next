import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Groups</h1>
        <p className="text-muted-foreground">Manage existing groups, edit details, and control status.</p>
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
