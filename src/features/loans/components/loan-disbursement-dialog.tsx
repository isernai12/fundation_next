"use client"
import { formatCurrency } from "@/lib/format"

import { useState } from "react"
import { disburseLoan } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

interface Fund {
  id: string
  name: string
  groupId: string | null
  group: { name: string; code: string } | null
}

interface LoanDisbursementDialogProps {
  loanId: string
  loanAmount: number
  funds: Fund[]
  trigger?: React.ReactNode
}

export function LoanDisbursementDialog({ loanId, loanAmount, funds, trigger }: LoanDisbursementDialogProps) {
  const [open, setOpen] = useState(false)
  const [allocations, setAllocations] = useState<{ fundId: string, amount: number }[]>([])
  
  const groupFunds = funds.filter(f => f.groupId !== null)

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0)
  const remaining = loanAmount - totalAllocated

  const handleAddAllocation = () => {
    setAllocations([...allocations, { fundId: "", amount: 0 }])
  }

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index))
  }

  const handleUpdateAllocation = (index: number, field: "fundId" | "amount", value: string | number) => {
    const newAlloc = [...allocations]
    newAlloc[index] = { ...newAlloc[index], [field]: value }
    setAllocations(newAlloc)
  }

  const handleAutoAllocate = () => {
    if (groupFunds.length === 0) {
      toast.error("No group funds available for allocation")
      return
    }
    const amountPerGroup = Math.floor(loanAmount / groupFunds.length)
    const newAlloc = groupFunds.map(f => ({ fundId: f.id, amount: amountPerGroup }))
    
    // Distribute remainder
    const sum = newAlloc.reduce((s, a) => s + a.amount, 0)
    const diff = loanAmount - sum
    if (diff > 0) {
      newAlloc[newAlloc.length - 1].amount += diff
    }
    
    setAllocations(newAlloc)
  }

  const handleSubmit = async () => {
    if (totalAllocated !== loanAmount) {
      toast.error(`Total allocated must be exactly ৳${formatCurrency(loanAmount)}. Remaining: ৳${formatCurrency(remaining)}`)
      return
    }
    if (allocations.some(a => !a.fundId || a.amount <= 0)) {
      toast.error("Invalid allocations: All rows must have a fund selected and amount > 0")
      return
    }

    try {
      const res = await disburseLoan(loanId, allocations)
      if (res.success) {
        toast.success("Loan disbursed successfully and Ledger updated.")
        setOpen(false)
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
        {trigger || <Button variant="default">ঋণ বিতরণ</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ঋণ বিতরণ ও তহবিল বরাদ্দকরণ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-muted p-4 rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">ঋণের পরিমাণ</p>
              <p className="text-2xl font-bold">৳{formatCurrency(loanAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">বাকি বরাদ্দ</p>
              <p className={`text-2xl font-bold ${remaining === 0 ? "text-green-500" : remaining < 0 ? "text-red-500" : ""}`}>
                ৳{(remaining).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-semibold">বরাদ্দের উৎস</h3>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleAutoAllocate}>অটো বরাদ্দ</Button>
              <Button variant="outline" size="sm" onClick={handleAddAllocation}>+ উৎস যুক্ত করুন</Button>
            </div>
          </div>

          <div className="space-y-3">
            {allocations.map((alloc, idx) => (
              <div key={idx} className="flex space-x-2 items-center">
                <Select value={alloc.fundId} onValueChange={(val) => handleUpdateAllocation(idx, "fundId", val)}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="উৎস তহবিল নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupFunds.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name} ({f.group?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">৳</span>
                  <Input 
                    type="number" 
                    className="pl-7" 
                    value={alloc.amount || ""} 
                    onChange={(e) => { const v = parseFloat(e.target.value); handleUpdateAllocation(idx, "amount", isNaN(v) ? 0 : v) }} 
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveAllocation(idx)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            {allocations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">কোনো বরাদ্দ যুক্ত করা হয়নি। উৎস যুক্ত করুন বা অটো বরাদ্দ ক্লিক করুন।</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>বাতিল করুন</Button>
            <Button onClick={handleSubmit} disabled={remaining !== 0}>বিতরণ নিশ্চিত করুন</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
