"use client"
import { getNow } from "@/lib/date";

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel
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
import { Download, Printer, FileSpreadsheet } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

interface ReportViewerProps {
  title: string
  columns: ColumnDef<any>[]
  data: any[]
}

export function ReportViewer({ title, columns, data }: ReportViewerProps) {
    const { t } = useLanguage();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  })

  const handleExportCSV = () => {
    const headers = columns.map(c => c.header as string).join(",")
    const rows = data.map(row => {
      return columns.map(c => {
        const key = (c as any).accessorKey
        if (key && row[key] !== undefined) return row[key]
        return ""
      }).join(",")
    }).join("\n")
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}_${getNow().toLocaleDateString('en-CA')}.csv`
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end print:hidden">
        <div className="space-y-2 w-1/3">
          <label className="text-sm font-medium">{t("reports.search_133484")}</label>
          <Input 
            placeholder={t("reports.global_search_1c56b2")} 
            value={globalFilter} 
            onChange={e => setGlobalFilter(e.target.value)} 
          />
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> {t("reports.export_csv_c04f1e")}</Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> {t("reports.print_13dba2")}</Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return ((
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                            ))}
                          </TableRow>
                        ));
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return ((
                              <TableRow key={row.id}>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("reports.no_data_found_e7e327")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2 print:hidden">
        <span className="text-sm text-muted-foreground">{t("reports.total_records_bdce1a")}{data.length}</span>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{t("reports.previous_dd1f77")}</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{t("reports.next_10ac3d")}</Button>
        </div>
      </div>
    </div>
  )
}
