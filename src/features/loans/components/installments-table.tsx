"use client"

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

export function InstallmentsTable({ installments }: { installments: any[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<any>[] = [
    {
      id: "loanNumber",
      header: "Loan #",
      accessorFn: row => row.loan.loanNumber,
    },
    {
      id: "beneficiary",
      header: "Beneficiary",
      accessorFn: row => `${row.loan.beneficiary.firstName} ${row.loan.beneficiary.lastName}`,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => new Date(row.getValue("dueDate")).toLocaleDateString(),
    },
    {
      accessorKey: "amount",
      header: "Installment Amount",
      cell: ({ row }) => `৳${(row.getValue("amount") as number) / 100}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.getValue("status") as string
        const dueDate = new Date(row.getValue("dueDate"))
        const isOverdue = s === "PENDING" && dueDate < new Date()
        
        return (
          <Badge variant={isOverdue ? "destructive" : s === "PAID" ? "default" : "outline"}>
            {isOverdue ? "OVERDUE" : s}
          </Badge>
        )
      },
    },
  ]

  const table = useReactTable({
    data: installments,
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
                  No installments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
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
