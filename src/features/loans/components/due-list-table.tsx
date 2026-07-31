"use client"
import { formatDate } from "@/lib/format"
import { useState, useMemo } from "react"
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
  FilterFn
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
import { Printer, Search, FilterX } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/i18n/LanguageProvider";

const globalSearchFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const searchValue = value.toLowerCase()
  const loanNumber = (row.original.loanNumber || "").toLowerCase()
  const beneficiaryName = (row.original.beneficiary?.fullName || "").toLowerCase()
  const phone = (row.original.beneficiary?.phone || "").toLowerCase()
  return loanNumber.includes(searchValue) || beneficiaryName.includes(searchValue) || phone.includes(searchValue)
}

export function DueListTable({ data, initialDueStatusFilter = "ALL" }: { data: any[], initialDueStatusFilter?: string }) {
    const { t } = useLanguage();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "loanNumber",
      header: "Loan #",
    },
    {
      id: "beneficiary",
      accessorFn: row => row.beneficiary ? row.beneficiary.fullName : "Unknown",
      header: "Beneficiary",
    },
    {
      id: "phone",
      header: "Mobile",
      cell: ({ row }) => row.original.beneficiary?.phone || row.original.beneficiary?.mobile || "-"
    },
    {
      id: "group",
      header: "Group",
      cell: ({ row }) => row.original.beneficiary?.member?.group?.name || "-"
    },
    {
      accessorKey: "installmentType",
      header: "Inst. Type",
      cell: ({ row }) => row.getValue("installmentType") || "-"
    },
    {
      id: "nextDueDate",
      header: "Next Due Date",
      cell: ({ row }) => row.original.nextDueDate ? formatDate(row.original.nextDueDate) : "-",
    },
    {
      id: "remainingBalance",
      header: "Remaining Balance",
      cell: ({ row }) => <span className="font-medium text-red-600">৳{row.original.remainingBalance}</span>,
    },
    {
      accessorKey: "dueStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("dueStatus") as string
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
        if (status === "Due Today") variant = "default"
        if (status === "Overdue") variant = "destructive"
        return <Badge variant={variant}>{status}</Badge>
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
    globalFilterFn: globalSearchFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      columnFilters,
      sorting,
      globalFilter,
    },
  })

  // Set initial filter on mount if provided
  useMemo(() => {
    if (initialDueStatusFilter !== "ALL") {
      table.getColumn("dueStatus")?.setFilterValue(initialDueStatusFilter)
    }
  }, [initialDueStatusFilter, table])

  return (
    <div className="space-y-4 print-section">
      <div className="bg-card border rounded-md p-4 space-y-4 no-print">
        <div className="flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <FilterX className="h-5 w-5" />
            {t("loans.filter_dues_8ca8a1")}</div>
          <Button variant="outline" onClick={() => {
                    return (window.print());
                  }}>
            <Printer className="mr-2 h-4 w-4" />
            {t("loans.print_list_f85417")}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("loans.search_id_name_mobil_04a67c")}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select
            value={(table.getColumn("dueStatus")?.getFilterValue() as string) ?? "ALL"}
            onValueChange={(v) => table.getColumn("dueStatus")?.setFilterValue(v === "ALL" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("loans.due_status_340b09")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("loans.all_dues_aabcf2")}</SelectItem>
              <SelectItem value="Due Today">{t("loans.due_today_b523c0")}</SelectItem>
              <SelectItem value="Upcoming Due">{t("loans.upcoming_due_b62269")}</SelectItem>
              <SelectItem value="Overdue">{t("loans.overdue_3f165a")}</SelectItem>
            </SelectContent>
          </Select>
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
                   {t("loans.no_due_loans_found_e2ffda")}</TableCell>
               </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 no-print">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t("loans.previous_dd1f77")}</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t("loans.next_10ac3d")}</Button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
