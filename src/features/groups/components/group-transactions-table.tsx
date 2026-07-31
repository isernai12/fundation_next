"use client"
import { formatCurrency } from "@/lib/format"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/i18n/LanguageProvider";

// Placeholder type
export type TransactionPlaceholder = {
  id: string
  date: string
  type: string
  reference: string
  amount: number
  status: string
  remarks: string
}

export function GroupTransactionsTable({ data }: { data: TransactionPlaceholder[] }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<TransactionPlaceholder>[] = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: "reference",
      header: "Reference",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `৳${formatCurrency(row.original.amount)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "COMPLETED" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Input
          placeholder={t("groups.search_transactions_9eefbe")}
          value={(table.getColumn("reference")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("reference")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <Select
          onValueChange={(value) =>
            table.getColumn("type")?.setFilterValue(value === "ALL" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("groups.all_types_90b2f7")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("groups.all_types_90b2f7")}</SelectItem>
            <SelectItem value="Contribution">{t("groups.contribution_3023db")}</SelectItem>
            <SelectItem value="Loan">{t("groups.loan_9ad81a")}</SelectItem>
            <SelectItem value="Repayment">{t("groups.repayment_5bea85")}</SelectItem>
            <SelectItem value="Grant">{t("groups.grant_e6bec5")}</SelectItem>
            <SelectItem value="Adjustment">{t("groups.adjustment_422775")}</SelectItem>
            <SelectItem value="Transfer">{t("groups.transfer_695081")}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="max-w-[150px]" />
        <span className="text-sm text-muted-foreground">to</span>
        <Input type="date" className="max-w-[150px]" />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return ((
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              )
                            })}
                          </TableRow>
                        ));
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return ((
                              <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ));
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t("groups.no_transactions_foun_a51c76")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t("groups.previous_dd1f77")}</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("groups.next_10ac3d")}</Button>
      </div>
    </div>
  )
}
