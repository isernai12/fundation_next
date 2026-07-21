"use client"
import { formatCurrency } from "@/lib/format"

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
      toast.error("কিস্তির পরিমাণ শূন্যের বেশি হতে হবে।")
      return
    }
    if (amount > outstandingBalance) {
      toast.error("কিস্তির পরিমাণ বাকি ঋণের চেয়ে বেশি হতে পারে না।")
      return
    }

    try {
      const res = await repayLoan(loanId, amount, paymentMethod, reference)
      if (res.success) {
        toast.success("কিস্তি গ্রহণ সম্পন্ন হয়েছে।")
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
          <DialogTitle>কিস্তি গ্রহণ করুন</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted p-4 rounded-md flex justify-between items-center">
            <span className="text-sm font-semibold">বাকি ঋণের পরিমাণ</span>
            <span className="text-xl font-bold">৳{formatCurrency(outstandingBalance)}</span>
          </div>

          <div className="space-y-2">
            <Label>কিস্তির পরিমাণ (৳)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={amount || ""} 
              onChange={e => { const v = parseFloat(e.target.value); setAmount(isNaN(v) ? 0 : v); }} 
            />
          </div>

          <div className="space-y-2">
            <Label>পরিশোধের মাধ্যম</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">ক্যাশ (Cash)</SelectItem>
                <SelectItem value="BANK_TRANSFER">ব্যাংক ট্রান্সফার (Bank Transfer)</SelectItem>
                <SelectItem value="CHECK">চেক (Check)</SelectItem>
                <SelectItem value="CARD">কার্ড (Card)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>রেফারেন্স নম্বর (ঐচ্ছিক)</Label>
            <Input 
              placeholder="ট্রানজেকশন আইডি, চেক নম্বর..." 
              value={reference} 
              onChange={e => setReference(e.target.value)} 
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল করুন</Button>
            <Button onClick={handleSubmit} disabled={amount <= 0 || amount > outstandingBalance}>নিশ্চিত করুন</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
