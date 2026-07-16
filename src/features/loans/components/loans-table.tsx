"use client"

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
import { Eye, Edit, MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function LoansTable({ data }: { data: any[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "loanNumber",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Loan #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "beneficiary",
      header: "Beneficiary",
      accessorFn: row => row.beneficiary ? `${row.beneficiary.firstName} ${row.beneficiary.lastName}` : "Unknown",
      cell: ({ row }) => row.original.beneficiary ? `${row.original.beneficiary.firstName} ${row.original.beneficiary.lastName}` : "Unknown"
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `$${(row.getValue("amount") as number) / 100}`,
    },
    {
      id: "paid",
      header: "Paid",
      cell: ({ row }) => {
        const reps = row.original.repayments || []
        const total = reps.reduce((sum: number, r: any) => sum + r.amount, 0)
        return `$${total / 100}`
      }
    },
    {
      id: "remaining",
      header: "Remaining",
      cell: ({ row }) => {
        const reps = row.original.repayments || []
        const totalPaid = reps.reduce((sum: number, r: any) => sum + r.amount, 0)
        const amt = row.getValue("amount") as number
        return `$${(amt - totalPaid) / 100}`
      }
    },
    {
      accessorKey: "installmentCount",
      header: "Installments",
    },
    {
      accessorKey: "status",
      header: "Status",
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
      accessorKey: "requestedDate",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("requestedDate")).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => {
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
                <Link href={`/loans/manage/${row.original.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> Manage
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/loans/${row.original.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> Legacy View
                </Link>
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
          placeholder="Filter by Loan Number..."
          value={(table.getColumn("loanNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("loanNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder="Filter by Beneficiary..."
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
                  No loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
