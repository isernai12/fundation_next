"use client"

import { useState } from "react"
import { repayLoan } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LoanRepaymentDialogProps {
  loanId: string
  outstandingBalance: number
  trigger?: React.ReactNode
}

export function LoanRepaymentDialog({ loanId, outstandingBalance, trigger }: LoanRepaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [reference, setReference] = useState("")

  const handleSubmit = async () => {
    if (amount <= 0) {
      toast.error("Repayment amount must be positive")
      return
    }
    if (amount > outstandingBalance) {
      toast.error("Repayment exceeds outstanding balance")
      return
    }

    try {
      const res = await repayLoan(loanId, amount, paymentMethod, reference)
      if (res.success) {
        toast.success("Repayment recorded and funds returned to source.")
        setOpen(false)
        setAmount(0)
      } else {
        toast.error((res as any).error)
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Record Repayment</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Loan Repayment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted p-4 rounded-md flex justify-between items-center">
            <span className="text-sm font-semibold">Outstanding Balance</span>
            <span className="text-xl font-bold">${(outstandingBalance / 100).toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <Label>Repayment Amount ($)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={amount ? amount / 100 : ""} 
              onChange={e => setAmount(Number(e.target.value) * 100)} 
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference Number (Optional)</Label>
            <Input 
              placeholder="Txn ID, Check number..." 
              value={reference} 
              onChange={e => setReference(e.target.value)} 
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={amount <= 0 || amount > outstandingBalance}>Confirm Repayment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
