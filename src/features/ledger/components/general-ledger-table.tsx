"use client"
import { formatCurrency, formatDate } from "@/lib/format"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import { ArrowUpDown } from "lucide-react"
import { LedgerEntry, LedgerTransaction, Fund } from "@prisma/client"

type LedgerEntryWithDetails = LedgerEntry & {
  transaction: LedgerTransaction
  fund: Fund & {
    group: { name: string; code: string } | null
  }
}

export function GeneralLedgerTable({ data }: { data: LedgerEntryWithDetails[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<LedgerEntryWithDetails>[] = [
    {
      accessorFn: (row) => row.transaction.date,
      id: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.original.transaction.date)
    },
    {
      accessorFn: (row) => row.transaction.type,
      id: "type",
      header: "Type",
    },
    {
      accessorFn: (row) => row.fund.group ? row.fund.group.name : row.fund.name,
      id: "fund",
      header: "Fund",
    },
    {
      accessorFn: (row) => row.transaction.notes || row.transaction.referenceId || "N/A",
      id: "description",
      header: "Description",
    },
    {
      accessorKey: "debit",
      header: "Debit",
      cell: ({ row }) => {
        return !row.original.isCredit ? <span className="font-medium">৳{formatCurrency(row.original.amount)}</span> : "-"
      }
    },
    {
      accessorKey: "credit",
      header: "Credit",
      cell: ({ row }) => {
        return row.original.isCredit ? <span className="font-medium">৳{formatCurrency(row.original.amount)}</span> : "-"
      }
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No ledger entries found.
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
