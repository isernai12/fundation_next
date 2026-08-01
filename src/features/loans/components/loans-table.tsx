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
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  ArrowUpDown,
  FileText,
  CreditCard,
  Printer,
  CheckCircle,
  Trash2,
  BookOpen,
  Search,
  FilterX
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteLoanAction } from "../actions"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

const globalSearchFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const searchValue = value.toLowerCase()
  const loanNumber = (row.original.loanNumber ).toLowerCase()
  const beneficiaryName = (row.original.beneficiary?.fullName ).toLowerCase()
  const phone = (row.original.beneficiary?.phone ).toLowerCase()
  return loanNumber.includes(searchValue) || beneficiaryName.includes(searchValue) || phone.includes(searchValue)
}

export function LoansTable({ data }: { data: any[] }) {
    const { t } = useLanguage();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [amountRange, setAmountRange] = useState({ min: "", max: "" })
  const router = useRouter()
  const { can } = useRbac()

  const canView = can("Loans", "View")
  const canEdit = can("Loans", "Edit")
  const canDelete = can("Loans", "Delete")
  const canManage = can("Loans", "Manage")

  const handleDelete = async (id: string, hasRepayments: boolean) => {
    if (hasRepayments) {
      toast.error(t("loans.manage.deleteErrorHasRepayments") )
      return
    }
    if (!confirm(t("loans.manage.deleteConfirm") )) return

    const res = await deleteLoanAction(id)
    if (res.success) {
      toast.success(t("loans.manage.deleteSuccess") )
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleMarkAsCompleted = async (id: string) => {
    toast.info(t("loans.manage.comingSoon") )
  }

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
      totalLoans: data.length,
      activeLoans: data.filter(d => d.status === "ACTIVE").length,
      completedLoans: data.filter(d => d.status === "COMPLETED").length,
      dueToday: data.filter(d => d.dueStatus === "Due Today").length,
      overdueLoans: data.filter(d => d.dueStatus === "Overdue").length,
      totalOutstanding: data.reduce((acc, d) => acc + (d.remainingBalance || 0), 0),
      totalRecovered: data.reduce((acc, d) => acc + (d.totalPaidAmount || 0), 0),
    }
  }, [data])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "loanNumber",
      header: ({ column }) => {
        return ((
              <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                {t("loans.table.columns.loanNo")}<ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ));
      },
    },
    {
      id: "beneficiary",
      accessorFn: row => row.beneficiary ? row.beneficiary.fullName : "Unknown",
      header: t("loans.table.columns.beneficiary"),
    },
    {
      id: "phone",
      header: t("loans.table.columns.phone"),
      cell: ({ row }) => row.original.beneficiary?.phone 
    },
    {
      accessorKey: "amount",
      header: t("loans.table.columns.amount"),
      cell: ({ row }) => `৳${(row.getValue("amount") as number)}`,
    },
    {
      id: "remaining",
      header: t("loans.table.columns.balance"),
      cell: ({ row }) => `৳${row.original.remainingBalance}`,
    },
    {
      id: "nextDueDate",
      header: t("loans.table.columns.nextDue"),
      cell: ({ row }) => row.original.nextDueDate ? formatDate(row.original.nextDueDate) : "-",
    },
    {
      accessorKey: "dueStatus",
      header: t("loans.table.columns.due"),
      cell: ({ row }) => {
        const status = row.getValue("dueStatus") as string
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
        if (status === "Due Today") variant = "default"
        if (status === "Overdue") variant = "destructive"
        if (status === "Completed") variant = "secondary"
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: t("loans.table.columns.status"),
      cell: ({ row }) => {
        const s = row.getValue("status") as string
        return (
          <Badge variant={s === "ACTIVE" ? "default" : s === "COMPLETED" ? "secondary" : "destructive"}>
            {s}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const loan = row.original
        const hasRepayments = loan.repayments && loan.repayments.length > 0
        const isEligibleForCompletion = loan.status === "ACTIVE"

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("loans.table.actions.menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("loans.table.actions.menu")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/loans/${loan.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> {t("loans.table.actions.view")}</Link>
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/loans/${loan.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> {t("loans.table.actions.edit")}</Link>
                </DropdownMenuItem>
              )}
              {canManage && isEligibleForCompletion && loan.remainingBalance > 0 && (
                <DropdownMenuItem asChild>
                  <Link href={`/loans/repayments?loanId=${loan.id}`}>
                    <CreditCard className="mr-2 h-4 w-4" /> {t("loans.table.actions.repay")}</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canView && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/loans/${loan.id}#history`}>
                      <FileText className="mr-2 h-4 w-4" /> {t("loans.table.actions.ledger")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/loans/ledger?loanId=${loan.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" /> {t("loans.table.actions.ledger")}</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => {
                      return (window.print());
                    }}>
                <Printer className="mr-2 h-4 w-4" /> {t("loans.table.actions.print")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  onClick={() => handleDelete(loan.id, hasRepayments)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> {t("loans.table.actions.delete")}</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "loanType",
      enableHiding: true,
      header: () => null,
      cell: () => null,
    }
  ]

  const table = useReactTable({
    data: filteredData,
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
    initialState: {
      columnVisibility: {
        loanType: false
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.manage.totalLoans") }</div>
            <div className="text-2xl font-bold">{summary.totalLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.manage.activeLoans") }</div>
            <div className="text-2xl font-bold text-blue-600">{summary.activeLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.manage.completedLoans") }</div>
            <div className="text-2xl font-bold text-green-600">{summary.completedLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 bg-orange-50 dark:bg-orange-950/20">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.table.dueStatus.dueToday")}</div>
            <div className="text-2xl font-bold text-orange-600">{summary.dueToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 bg-red-50 dark:bg-red-950/20">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.manage.overdueLoans") }</div>
            <div className="text-2xl font-bold text-red-600">{summary.overdueLoans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.manage.totalOutstanding") }</div>
            <div className="text-xl font-bold">৳{summary.totalOutstanding}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">{t("loans.manage.totalRecovered") }</div>
            <div className="text-xl font-bold text-green-600">৳{summary.totalRecovered}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-md p-4 space-y-4">
        <div className="flex items-center gap-2 font-medium">
          <FilterX className="h-5 w-5" />
          {t("loans.manage.filterLoans") }</div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("loans.table.search")}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <Select
            value={(table.getColumn("loanType")?.getFilterValue() as string) ?? "ALL"}
            onValueChange={(v) => table.getColumn("loanType")?.setFilterValue(v === "ALL" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("loans.table.columns.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("loans.form.types.all") }</SelectItem>
              <SelectItem value="BUSINESS">{t("loans.form.purposes.business")}</SelectItem>
              <SelectItem value="OTHER">{t("loans.form.purposes.other")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
            onValueChange={(v) => table.getColumn("status")?.setFilterValue(v === "ALL" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("loans.table.columns.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("loans.form.types.all") }</SelectItem>
              <SelectItem value="ACTIVE">{t("loans.table.status.active")}</SelectItem>
              <SelectItem value="COMPLETED">{t("loans.manage.completedLoans") }</SelectItem>
              <SelectItem value="OVERDUE">{t("loans.table.status.overdue") }</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={(table.getColumn("dueStatus")?.getFilterValue() as string) ?? "ALL"}
            onValueChange={(v) => table.getColumn("dueStatus")?.setFilterValue(v === "ALL" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("loans.table.columns.due")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("loans.form.types.all") }</SelectItem>
              <SelectItem value="Due Today">{t("loans.table.dueStatus.dueToday")}</SelectItem>
              <SelectItem value="Upcoming Due">{t("loans.table.dueStatus.upcomingDue")}</SelectItem>
              <SelectItem value="Overdue">{t("loans.table.status.overdue") }</SelectItem>
              <SelectItem value="No Due">{t("loans.table.dueStatus.noDue")}</SelectItem>
              <SelectItem value="Completed">{t("loans.manage.completedLoans") }</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              placeholder={t("loans.table.filters.min")} 
              value={amountRange.min}
              onChange={e => setAmountRange(p => ({ ...p, min: e.target.value }))}
            />
            <Input 
              type="number" 
              placeholder={t("loans.table.filters.max")}
              value={amountRange.max}
              onChange={e => setAmountRange(p => ({ ...p, max: e.target.value }))}
            />
          </div>
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
                  {t("loans.table.empty")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t("loans.table.pagination.previous")}</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t("loans.table.pagination.next")}</Button>
      </div>
    </div>
  )
}
