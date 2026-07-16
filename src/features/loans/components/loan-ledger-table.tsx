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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"

export function LoanLedgerTable({ transactions }: { transactions: any[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "referenceId",
      header: "Reference",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type") as string}</Badge>
      )
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                View Entries <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 text-sm bg-muted/50 p-2 rounded-md">
              <div className="grid grid-cols-3 font-semibold mb-1">
                <div>Fund</div>
                <div className="text-right">Debit</div>
                <div className="text-right">Credit</div>
              </div>
              {row.original.entries.map((e: any) => (
                <div key={e.id} className="grid grid-cols-3">
                  <div>{e.fund?.group ? `${e.fund.group.name} (${e.fund.name})` : e.fund?.name}</div>
                  <div className="text-right">{!e.isCredit ? `$${e.amount / 100}` : "-"}</div>
                  <div className="text-right">{e.isCredit ? `$${e.amount / 100}` : "-"}</div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )
      }
    }
  ]

  const table = useReactTable({
    data: transactions,
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
          placeholder="Filter by Reference..."
          value={(table.getColumn("referenceId")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("referenceId")?.setFilterValue(event.target.value)}
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
                  No transactions found.
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
