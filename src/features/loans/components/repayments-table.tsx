"use client"
import { formatCurrency, formatDate } from "@/lib/format"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { repayLoan } from "../actions"
import { useRouter } from "next/navigation"

export function RepaymentsTable({ repayments, activeLoans }: { repayments: any[], activeLoans: any[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [selectedLoanId, setSelectedLoanId] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [reference, setReference] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedLoan = activeLoans.find(l => l.id === selectedLoanId)
  const outstandingBalance = selectedLoan 
    ? selectedLoan.amount - selectedLoan.repayments.reduce((s: number, r: any) => s + r.amount, 0)
    : 0

  const handleRepay = async () => {
    if (!selectedLoanId) return toast.error("Select a loan")
    if (amount <= 0) return toast.error("Amount must be positive")
    if (amount > outstandingBalance) return toast.error("Amount exceeds outstanding balance")

    setIsSubmitting(true)
    try {
      const res = await repayLoan(selectedLoanId, amount, paymentMethod, reference)
      if (res.success) {
        toast.success("Repayment recorded")
        setOpen(false)
        setSelectedLoanId("")
        setAmount(0)
        setReference("")
        router.refresh()
      } else {
        toast.error((res as any).error)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: ColumnDef<any>[] = [
    {
      id: "loanNumber",
      header: "Loan #",
      accessorFn: row => row.loan.loanNumber,
    },
    {
      id: "beneficiary",
      header: "Beneficiary",
      accessorFn: row => `${row.loan.beneficiary.fullName || 'নাম পাওয়া যায়নি'}`,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "amount",
      header: "Amount Paid",
      cell: ({ row }) => <span className="font-medium text-green-600">+${(row.getValue("amount") as number)}</span>,
    },
    {
      id: "ledgerRef",
      header: "Ledger Ref",
      accessorFn: row => row.ledgerTransaction?.referenceId,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("status") as string}</Badge>
      ),
    },
  ]

  const table = useReactTable({
    data: repayments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter by Loan #..."
          value={(table.getColumn("loanNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("loanNumber")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Record New Repayment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Loan Repayment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Active Loan</Label>
                <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Loan" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLoans.map(l => {
                      const outstanding = l.amount - l.repayments.reduce((s: number, r: any) => s + r.amount, 0)
                      return (
                        <SelectItem key={l.id} value={l.id}>
                          {l.loanNumber} - {`${l.beneficiary.fullName || 'নাম পাওয়া যায়নি'}`} (Due: ${(outstanding).toFixed(2)})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedLoan && (
                <>
                  <div className="bg-muted p-4 rounded-md flex justify-between items-center">
                    <span className="text-sm font-semibold">Outstanding Balance</span>
                    <span className="text-xl font-bold">৳{formatCurrency(outstandingBalance)}</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Repayment Amount ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={amount ? amount : ""} 
                      onChange={e => setAmount(Number(e.target.value))} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Button onClick={handleRepay} disabled={isSubmitting || amount <= 0 || amount > outstandingBalance}>
                      {isSubmitting ? "Processing..." : "Confirm Repayment"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No repayments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
