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
      header: t("groups.transactions.table.columns.date"),
    },
    {
      accessorKey: "type",
      header: t("groups.transactions.table.columns.type"),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type}</Badge>
      ),
    },
    {
      accessorKey: "reference",
      header: t("groups.transactions.table.columns.reference"),
    },
    {
      accessorKey: "amount",
      header: t("groups.transactions.table.columns.amount"),
      cell: ({ row }) => `৳${formatCurrency(row.original.amount)}`,
    },
    {
      accessorKey: "status",
      header: t("groups.transactions.table.columns.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.status === "COMPLETED" ? "default" : "secondary"}>
          {row.original.status === "COMPLETED" ? t("groups.transactions.table.status.completed") : t("groups.transactions.table.status.pending")}
        </Badge>
      ),
    },
    {
      accessorKey: "remarks",
      header: t("groups.transactions.table.columns.remarks"),
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
          placeholder={t("groups.transactions.table.search")}
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
            <SelectValue placeholder={t("groups.transactions.table.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("groups.transactions.table.allTypes")}</SelectItem>
            <SelectItem value="Contribution">{t("groups.transactions.types.contribution")}</SelectItem>
            <SelectItem value="Loan">{t("groups.transactions.types.loan")}</SelectItem>
            <SelectItem value="Repayment">{t("groups.transactions.types.repayment")}</SelectItem>
            <SelectItem value="Grant">{t("groups.transactions.types.grant")}</SelectItem>
            <SelectItem value="Adjustment">{t("groups.transactions.types.adjustment")}</SelectItem>
            <SelectItem value="Transfer">{t("groups.transactions.types.transfer")}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="max-w-[150px]" />
        <span className="text-sm text-muted-foreground">{t("groups.transactions.table.to")}</span>
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
                  {t("groups.transactions.table.empty")}</TableCell>
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
          {t("groups.table.pagination.previous")}</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("groups.table.pagination.next")}</Button>
      </div>
    </div>
  )
}
