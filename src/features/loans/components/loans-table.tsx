"use client"
import { formatDate } from "@/lib/format"
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
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
  Eye, 
  Edit, 
  MoreHorizontal, 
  ArrowUpDown,
  FileText,
  CreditCard,
  Printer,
  CheckCircle,
  Trash2,
  BookOpen
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteLoanAction } from "../actions"

export function LoansTable({ data }: { data: any[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const router = useRouter()

  const handleDelete = async (id: string, hasRepayments: boolean) => {
    if (hasRepayments) {
      toast.error("যেহেতু এই ঋণের কিস্তি প্রদান করা হয়েছে, তাই এটি মুছে ফেলা সম্ভব নয়।")
      return
    }
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই ঋণ মুছে ফেলতে চান?")) return

    const res = await deleteLoanAction(id)
    if (res.success) {
      toast.success("ঋণ সফলভাবে মুছে ফেলা হয়েছে।")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleMarkAsCompleted = async (id: string) => {
    // Call server action to mark as completed - needs to be implemented in actions.ts if not already
    toast.info("Coming soon: Mark as completed")
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "loanNumber",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            ঋণ নম্বর
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "beneficiary",
      header: "সুবিধাভোগীর নাম",
      accessorFn: row => row.beneficiary ? `${row.beneficiary.fullName || 'নাম পাওয়া যায়নি'}` : "Unknown",
      cell: ({ row }) => row.original.beneficiary ? `${row.original.beneficiary.fullName || 'নাম পাওয়া যায়নি'}` : "Unknown"
    },
    {
      id: "phone",
      header: "মোবাইল নম্বর",
      cell: ({ row }) => row.original.beneficiary?.phone || "-"
    },
    {
      accessorKey: "amount",
      header: "ঋণের পরিমাণ",
      cell: ({ row }) => `৳${(row.getValue("amount") as number)}`,
    },
    {
      id: "remaining",
      header: "বাকি ঋণ",
      cell: ({ row }) => {
        const reps = row.original.repayments || []
        const totalPaid = reps.reduce((sum: number, r: any) => sum + r.amount, 0)
        const amt = row.getValue("amount") as number
        return `৳${(amt - totalPaid)}`
      }
    },
    {
      accessorKey: "status",
      header: "অবস্থা",
      cell: ({ row }) => {
        const s = row.getValue("status") as string
        return (
          <Badge variant={s === "ACTIVE" ? "default" : s === "COMPLETED" ? "secondary" : s === "PENDING" ? "outline" : "destructive"}>
            {s}
          </Badge>
        )
      },
    },
    {
      id: "dueDate",
      header: "পরবর্তী কিস্তির তারিখ",
      cell: ({ row }) => {
        const installments = row.original.installments || []
        const nextInstallment = installments.find((i: any) => i.status === "PENDING")
        if (nextInstallment) {
          return formatDate(nextInstallment.dueDate)
        }
        return "N/A"
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const loan = row.original
        const hasRepayments = loan.repayments && loan.repayments.length > 0
        const isEligibleForCompletion = loan.status === "ACTIVE" // Add logic for completion

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/loans/${loan.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/loans/${loan.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> ঋণ সংশোধন করুন
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/loans/${loan.id}?action=repay`}>
                  <CreditCard className="mr-2 h-4 w-4" /> কিস্তি গ্রহণ করুন
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/loans/ledger?loanId=${loan.id}`}>
                  <BookOpen className="mr-2 h-4 w-4" /> ঋণের খতিয়ান
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/loans/${loan.id}#history`}>
                  <FileText className="mr-2 h-4 w-4" /> পরিশোধের ইতিহাস
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> প্রিন্ট করুন
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isEligibleForCompletion && (
                <DropdownMenuItem onClick={() => handleMarkAsCompleted(loan.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> সম্পন্ন মার্ক করুন
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleDelete(loan.id, hasRepayments)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> মুছে ফেলুন
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
  })

  return (
    <div>
      <div className="flex items-center space-x-2 py-4">
        <Input
          placeholder="ঋণ নম্বর দিয়ে খুঁজুন..."
          value={(table.getColumn("loanNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("loanNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="সুবিধাভোগীর নাম দিয়ে খুঁজুন..."
          value={(table.getColumn("beneficiary")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("beneficiary")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                  কোনো ঋণ পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          পূর্ববর্তী
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          পরবর্তী
        </Button>
      </div>
    </div>
  )
}
