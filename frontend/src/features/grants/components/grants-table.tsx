"use client"
import { formatCurrency, formatDate } from "@/lib/format"
import { useState, useMemo } from "react"
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
import { ArrowUpDown, Edit, Eye, Trash, MoreHorizontal, Printer, Archive, Search, FilterX, BookOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { Grant, FundAllocation, Fund } from "@prisma/client"
import { deleteGrant } from "../actions"
import { toast } from "sonner"
import Link from "next/link"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

type GrantWithDetails = Grant & {
  beneficiary: {
    fullName: string | null
    beneficiaryId: string
    phone?: string | null
  }
  allocations: (FundAllocation & {
    fund: Fund & {
      group: { name: string; code: string } | null
    }
  })[]
}

const globalSearchFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const searchValue = value.toLowerCase()
  const grantNo = (row.original.grantNumber || "").toLowerCase()
  const beneficiaryName = (row.original.beneficiary?.fullName || "").toLowerCase()
  const phone = (row.original.beneficiary?.phone || "").toLowerCase()
  return grantNo.includes(searchValue) || beneficiaryName.includes(searchValue) || phone.includes(searchValue)
}

export function GrantsTable({ data, manageMode = false }: { data: GrantWithDetails[], manageMode?: boolean }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [amountRange, setAmountRange] = useState({ min: "", max: "" })
  const { can } = useRbac()

  const canView = can("Grants", "View")
  const canEdit = can("Grants", "Edit")
  const canDelete = can("Grants", "Delete")

  const filteredData = useMemo(() => {
    return data.filter(item => {
      let keep = true
      if (amountRange.min) {
        keep = keep && item.amount >= Number(amountRange.min)
      }
      if (amountRange.max) {
        keep = keep && item.amount <= Number(amountRange.max)
      }
      return keep
    })
  }, [data, amountRange])

  const summary = useMemo(() => {
    return {
      totalGrants: data.length,
      approvedGrants: data.filter(d => d.status === "APPROVED" || d.status === "PAID").length,
      pendingGrants: data.filter(d => d.status === "PENDING").length,
      rejectedGrants: data.filter(d => d.status === "REJECTED").length,
      totalAmount: data.reduce((acc, d) => acc + (d.amount || 0), 0),
    }
  }, [data])

  const columns: ColumnDef<GrantWithDetails>[] = [
    {
      accessorKey: "grantNumber",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("grants.table.columns.grantNo")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "beneficiary",
      header: t("grants.table.columns.beneficiary"),
      cell: ({ row }) => `${row.original.beneficiary?.fullName || t("grants.table.nameNotFound")} (${row.original.beneficiary?.beneficiaryId})`
    },
    {
      accessorKey: "purpose",
      header: t("grants.table.columns.purpose"),
    },
    {
      accessorKey: "amount",
      header: t("grants.table.columns.amount"),
      cell: ({ row }) => `৳${formatCurrency(row.original.amount)}`
    },
    {
      accessorKey: "dateApproved",
      header: t("grants.table.columns.date"),
      cell: ({ row }) => row.original.dateApproved ? formatDate(row.original.dateApproved) : "N/A"
    },
    {
      id: "fundingSource",
      header: t("grants.table.columns.fundingSource"),
      cell: ({ row }) => {
        if (row.original.allocations.length === 0) return "-";
        return row.original.allocations.map(a => a.fund.name).join(", ");
      }
    },
    {
      accessorKey: "status",
      header: t("grants.table.columns.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.status === "PAID" || row.original.status === "APPROVED" ? "default" : row.original.status === "REJECTED" ? "destructive" : "secondary"}>
          {t(`grants.table.status.${row.original.status.toLowerCase()}`)}
        </Badge>
      )
    },
    {
      id: "actions",
      header: t("grants.table.columns.actions"),
      cell: ({ row }) => {
        const grant = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("grants.table.actions.menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("grants.table.actions.menu")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/grants/${grant.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> {t("grants.table.actions.view")}</Link>
                </DropdownMenuItem>
              )}
              {manageMode && (
                <>
                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/grants/${grant.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> {t("grants.table.actions.edit")}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`/grants/ledger?grantId=${grant.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" /> {t("grants.table.actions.ledger")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                              return (window.print());
                            }}>
                    <Printer className="mr-2 h-4 w-4" /> {t("grants.table.actions.print")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={async () => {
                        if (confirm(t("grants.table.deleteConfirm"))) {
                          const res = await deleteGrant(grant.id)
                          if (res.success) {
                            toast.success(t("grants.table.deleteSuccess"))
                            window.location.reload()
                          }
                          else toast.error(res.error || t("grants.table.deleteFailed"))
                        }
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> {t("grants.table.actions.delete")}</DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: globalSearchFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div className="space-y-6">
      {manageMode && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1">{t("grants.manage.totalGrants")}</div>
                <div className="text-2xl font-bold">{summary.totalGrants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1">{t("grants.manage.approvedGrants")}</div>
                <div className="text-2xl font-bold text-green-600">{summary.approvedGrants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1">{t("grants.manage.pendingGrants")}</div>
                <div className="text-2xl font-bold text-orange-600">{summary.pendingGrants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1">{t("grants.manage.rejectedGrants")}</div>
                <div className="text-2xl font-bold text-red-600">{summary.rejectedGrants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground font-medium mb-1">{t("grants.manage.totalAmount")}</div>
                <div className="text-xl font-bold">৳{formatCurrency(summary.totalAmount)}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-card border rounded-md p-4 space-y-4">
            <div className="flex items-center gap-2 font-medium">
              <FilterX className="h-5 w-5" />
              {t("grants.manage.filterGrants")}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("grants.table.search")}
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <Select
                  value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
                  onValueChange={(v) => table.getColumn("status")?.setFilterValue(v === "ALL" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("grants.table.columns.status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("grants.table.status.all")}</SelectItem>
                    <SelectItem value="PENDING">{t("grants.table.status.pending")}</SelectItem>
                    <SelectItem value="APPROVED">{t("grants.table.status.approved")}</SelectItem>
                    <SelectItem value="REJECTED">{t("grants.table.status.rejected")}</SelectItem>
                    <SelectItem value="PAID">{t("grants.table.status.completed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2 flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder={t("grants.table.filters.min")} 
                  value={amountRange.min}
                  onChange={e => setAmountRange(p => ({ ...p, min: e.target.value }))}
                />
                <Input 
                  type="number" 
                  placeholder={t("grants.table.filters.max")}
                  value={amountRange.max}
                  onChange={e => setAmountRange(p => ({ ...p, max: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="rounded-md border bg-card mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return ((
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
                        ));
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return ((
                              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-muted-foreground">{t("grants.table.emptyTitle")}</span>
                    <span className="text-sm text-muted-foreground">{t("grants.table.emptySubtitle")}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t("grants.table.pagination.previous")}</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t("grants.table.pagination.next")}</Button>
      </div>
    </div>
  )
}
