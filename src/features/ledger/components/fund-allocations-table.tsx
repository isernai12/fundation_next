"use client"

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
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown } from "lucide-react"
import { FundAllocation, Fund } from "@prisma/client"

type AllocationWithDetails = FundAllocation & {
  fund: Fund & {
    group: { name: string; code: string } | null
  }
}

export function FundAllocationsTable({ data }: { data: AllocationWithDetails[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<AllocationWithDetails>[] = [
    {
      accessorFn: (row) => row.createdAt,
      id: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    {
      accessorKey: "targetType",
      header: "Operation Type",
      cell: ({ row }) => (
        <Badge variant={row.original.targetType === "GRANT" ? "destructive" : "default"}>
          {row.original.targetType}
        </Badge>
      )
    },
    {
      id: "reference",
      header: "Reference ID",
      cell: ({ row }) => row.original.loanId || row.original.grantId || "N/A"
    },
    {
      accessorFn: (row) => row.fund.group ? row.fund.group.name : row.fund.name,
      id: "fund",
      header: "Source Fund",
    },
    {
      accessorKey: "amount",
      header: "Allocated Amount",
      cell: ({ row }) => <span className="font-medium">৳{Number(row.original.amount).toLocaleString('en-BD', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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
                  No fund allocations found.
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
