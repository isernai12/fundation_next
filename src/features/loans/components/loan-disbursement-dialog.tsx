"use client"

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
      toast.error(`Total allocated must be exactly $${(loanAmount / 100).toFixed(2)}. Remaining: $${(remaining / 100).toFixed(2)}`)
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
        {trigger || <Button variant="default">Disburse Loan</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Disburse Loan & Fund Allocation Engine</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-muted p-4 rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">Loan Amount</p>
              <p className="text-2xl font-bold">${(loanAmount / 100).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining to Allocate</p>
              <p className={`text-2xl font-bold ${remaining === 0 ? "text-green-500" : remaining < 0 ? "text-red-500" : ""}`}>
                ${(remaining / 100).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Source Allocations</h3>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleAutoAllocate}>Auto Allocate</Button>
              <Button variant="outline" size="sm" onClick={handleAddAllocation}>+ Add Source</Button>
            </div>
          </div>

          <div className="space-y-3">
            {allocations.map((alloc, idx) => (
              <div key={idx} className="flex space-x-2 items-center">
                <Select value={alloc.fundId} onValueChange={(val) => handleUpdateAllocation(idx, "fundId", val)}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select Source Fund" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupFunds.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name} ({f.group?.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    className="pl-7" 
                    value={alloc.amount ? alloc.amount / 100 : ""} 
                    onChange={(e) => handleUpdateAllocation(idx, "amount", Number(e.target.value) * 100)} 
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveAllocation(idx)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            {allocations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No allocations added. Click Add Source or Auto Allocate.</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={remaining !== 0}>Confirm Disbursement</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
