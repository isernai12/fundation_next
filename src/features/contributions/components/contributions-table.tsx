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

export function ContributionsTable({ data }: { data: any[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<any>[] = [
    {
      accessorFn: (row) => `${row.member.firstName} ${row.member.lastName}`,
      header: "Member",
    },
    {
      accessorFn: (row) => row.member.group.name,
      header: "Group",
    },
    {
      accessorFn: (row) => `${new Date(0, row.month - 1).toLocaleString('default', { month: 'short' })} ${row.year}`,
      header: "Period",
    },
    {
      accessorKey: "expectedAmount",
      header: "Amount",
      cell: ({ row }) => `$${(row.getValue("expectedAmount") as number) / 100}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "PAID" ? "default" : row.getValue("status") === "PARTIAL" ? "secondary" : "destructive"}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "isAdditional",
      header: "Type",
      cell: ({ row }) => row.getValue("isAdditional") ? <Badge variant="outline">Additional</Badge> : <Badge variant="outline">Standard</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: "Date Recorded",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No contributions recorded.
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
