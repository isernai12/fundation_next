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
import { Printer, Download, FileSpreadsheet } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

// Define a placeholder type since Ledger is not fully implemented
export type LedgerEntryPlaceholder = {
  id: string
  date: string
  voucher: string
  type: string
  reference: string
  debit: number
  credit: number
  runningBalance: number
  remarks: string
}

export function GroupLedgerTable({ data }: { data: LedgerEntryPlaceholder[] }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<LedgerEntryPlaceholder>[] = [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "voucher",
      header: "Voucher",
    },
    {
      accessorKey: "type",
      header: "Transaction Type",
    },
    {
      accessorKey: "reference",
      header: "Reference",
    },
    {
      accessorKey: "debit",
      header: "Debit",
      cell: ({ row }) => row.original.debit > 0 ? `৳${formatCurrency(row.original.debit)}` : "-",
    },
    {
      accessorKey: "credit",
      header: "Credit",
      cell: ({ row }) => row.original.credit > 0 ? `৳${formatCurrency(row.original.credit)}` : "-",
    },
    {
      accessorKey: "runningBalance",
      header: "Running Balance",
      cell: ({ row }) => `৳${formatCurrency(row.original.runningBalance)}`,
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
    state: {
      sorting,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input placeholder={t("groups.search_ledger_entrie_0ced53")} className="max-w-sm" />
          <Input type="date" className="max-w-[150px]" />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" className="max-w-[150px]" />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" /> {t("groups.print_13dba2")}</Button>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> {t("groups.export_csv_c04f1e")}</Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> {t("groups.export_pdf_af8070")}</Button>
        </div>
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
                  {t("groups.no_ledger_entries_fo_c961f4")}</TableCell>
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
