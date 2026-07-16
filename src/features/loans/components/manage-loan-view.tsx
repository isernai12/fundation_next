"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { deleteLoanAction } from "../actions" // we need to create this

export function ManageLoanView({ loan }: { loan: any }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const hasRepayments = loan.repayments && loan.repayments.length > 0
  const canDelete = !hasRepayments

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("Cannot delete a loan with existing repayments.")
      return
    }
    if (!confirm("Are you sure you want to delete this loan? This action cannot be undone.")) return

    setIsDeleting(true)
    const result = await deleteLoanAction(loan.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success("Loan deleted successfully.")
      router.push("/loans")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={handlePrint} variant="outline">Print Details</Button>
        <Button variant="outline" disabled>Edit (Coming Soon)</Button>
        <Button variant="outline" disabled>Archive (Coming Soon)</Button>
        <Button onClick={handleDelete} disabled={!canDelete || isDeleting} variant="destructive">
          {isDeleting ? "Deleting..." : "Delete Loan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Number</span>
              <span className="font-medium">{loan.loanNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline">{loan.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${loan.amount / 100}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Installments</span>
              <span className="font-medium">{loan.installmentCount} @ ${loan.installmentAmount / 100}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose</span>
              <span className="font-medium">{loan.purpose}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beneficiary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{`${loan.beneficiary?.firstName} ${loan.beneficiary?.lastName}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{loan.beneficiary?.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{loan.beneficiary?.email || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Funding Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            {loan.allocations.map((a: any) => (
              <div key={a.id} className="flex justify-between border-b py-2 last:border-0">
                <span>{a.fund?.group ? `${a.fund.group.name} (${a.fund.name})` : a.fund?.name}</span>
                <span className="font-medium">${a.amount / 100}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
