"use client"
import { getNow } from "@/lib/date";
import { formatDate, formatShortMonth } from "@/lib/format"
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MonthlyContribution, ContributionPayment } from "@prisma/client"
import { MoreHorizontal, FileText, Download, Printer, Eye, Edit, Trash, CheckCircle, Clock } from "lucide-react"
import { EditContributionSheet } from "./edit-contribution-sheet"
import { ViewContributionDialog } from "./view-contribution-dialog"
import { deleteContribution, updateContribution } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type ContributionWithDetails = MonthlyContribution & {
  member: {
    memberId: string
    fullName: string | null
    group: { name: string; code: string } | null
  }
  payments: ContributionPayment[]
}

import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

export function ContributionsTable({ data }: { data: ContributionWithDetails[] }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  
  const [editingContribution, setEditingContribution] = useState<ContributionWithDetails | null>(null)
  const [viewingContribution, setViewingContribution] = useState<ContributionWithDetails | null>(null)
  
  const router = useRouter()
  const { can } = useRbac()

  const canView = can("Fund Collection", "View")
  const canEdit = can("Fund Collection", "Edit")
  const canDelete = can("Fund Collection", "Delete")

  const handleDelete = async (id: string) => {
    if (!confirm(t("contributions.table.actions.deleteConfirm"))) return;
    
    const res = await deleteContribution(id)
    if (res.success) {
      toast.success(t("contributions.table.messages.deletedSuccess"), { description: "Contribution and ledger entries reversed." })
    } else {
      toast.error(t("contributions.form.errorMessage"), { description: res.error })
    }
  }

  const handleStatusUpdate = async (contribution: ContributionWithDetails, newStatus: string) => {
    // If we're marking as paid but it has no payment details, we can't do it blindly. We should prompt them to edit instead.
    if (newStatus === "PAID" && contribution.payments.length === 0) {
      toast.info(t("contributions.table.messages.missingDetails"), { description: "Please use 'Edit' to enter payment amount and date." })
      setEditingContribution(contribution)
      return
    }

    const payload = {
      memberId: contribution.memberId,
      month: contribution.month,
      year: contribution.year,
      amount: contribution.payments[0]?.amount || contribution.expectedAmount,
      paymentDate: contribution.payments[0] ? new Date(contribution.payments[0].paymentDate).toISOString().split('T')[0] : getNow().toLocaleDateString('en-CA'),
      paymentMethod: contribution.payments[0]?.paymentMethod || "CASH",
      status: newStatus as any,
      isAdditional: contribution.isAdditional,
    }
    
    const res = await updateContribution(contribution.id, payload)
    if (res.success) {
      toast.success(t("contributions.table.messages.statusUpdated"), { description: `Contribution marked as ${newStatus}.` })
    } else {
      toast.error(t("contributions.form.errorMessage"), { description: res.error })
    }
  }

  const columns: ColumnDef<ContributionWithDetails>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => `${row.member.fullName || 'Unknown'} (${row.member.memberId})`,
      id: "member",
      header: t("contributions.table.columns.member"),
    },
    {
      accessorFn: (row) => row.member.group?.name || "N/A",
      id: "group",
      header: t("contributions.table.columns.group"),
    },
    {
      accessorFn: (row) => `${formatShortMonth(row.month - 1)} ${row.year}`,
      id: "period",
      header: t("contributions.table.columns.period"),
    },
    {
      accessorKey: "expectedAmount",
      header: t("contributions.table.columns.amount"),
      cell: ({ row }) => `৳${(row.getValue("expectedAmount") as number)}`,
    },
    {
      accessorKey: "status",
      header: t("contributions.table.columns.status"),
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "PAID" ? "default" : "destructive"}>
          {row.getValue("status") === "PAID" ? t("contributions.table.statuses.paid") : t("contributions.table.statuses.pending")}
        </Badge>
      ),
    },
    {
      accessorKey: "isAdditional",
      header: t("contributions.table.columns.type"),
      cell: ({ row }) => {
        return (row.getValue("isAdditional") ? <Badge variant="outline">{t("contributions.table.types.additional")}</Badge> : <Badge variant="outline">{t("contributions.table.types.standard")}</Badge>);
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const contribution = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("contributions.table.actions.menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("contributions.table.actions.menu")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem onClick={() => setViewingContribution(contribution)}>
                  <Eye className="mr-2 h-4 w-4" /> {t("contributions.table.actions.view")}</DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditingContribution(contribution)}>
                  <Edit className="mr-2 h-4 w-4" /> {t("contributions.table.actions.edit")}</DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {canEdit && contribution.status !== "PAID" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(contribution, "PAID")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> {t("contributions.table.actions.markPaid")}</DropdownMenuItem>
              )}
              {canEdit && contribution.status !== "PENDING" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(contribution, "PENDING")}>
                  <Clock className="mr-2 h-4 w-4" /> {t("contributions.table.actions.markPending")}</DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => {
                      return (window.print());
                    }}>
                <Printer className="mr-2 h-4 w-4" /> {t("contributions.table.actions.printReceipt")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                      return (window.print());
                    }}>
                <Download className="mr-2 h-4 w-4" /> {t("contributions.table.actions.downloadPdf")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/members/${contribution.memberId}`)}>
                <FileText className="mr-2 h-4 w-4" /> {t("contributions.table.actions.viewMember")}</DropdownMenuItem>
              
              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={() => {
                  if (contribution.payments.length > 0) {
                    toast.success(t("contributions.table.messages.ledgerFound"), { description: `Ledger Transaction ID: ${contribution.payments[0].ledgerTransactionId}` })
                  } else {
                    toast.error(t("contributions.table.messages.ledgerNotFound"), { description: "There is no ledger entry for unpaid contributions." })
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> {t("contributions.table.actions.viewLedger")}</DropdownMenuItem>
              
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(contribution.id)} className="text-red-600 focus:text-red-600">
                    <Trash className="mr-2 h-4 w-4" /> {t("contributions.table.actions.delete")}</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
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
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t("contributions.table.filterPlaceholder")}
            value={(table.getColumn("member")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("member")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => {
                        return (window.print());
                      }}>
              <Printer className="mr-2 h-4 w-4" /> {t("contributions.table.print")}</Button>
            <Button variant="outline" size="sm" onClick={() => {
                        return (window.print());
                      }}>
              <Download className="mr-2 h-4 w-4" /> {t("contributions.table.exportPdf")}</Button>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-card">
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("contributions.table.empty")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} {t("contributions.table.pagination.selected")}</div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {t("contributions.table.pagination.previous")}</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {t("contributions.table.pagination.next")}</Button>
        </div>
      </div>

      {editingContribution && (
        <EditContributionSheet
          isOpen={!!editingContribution}
          onClose={() => setEditingContribution(null)}
          contribution={editingContribution}
        />
      )}

      {viewingContribution && (
        <ViewContributionDialog
          isOpen={!!viewingContribution}
          onClose={() => setViewingContribution(null)}
          contribution={viewingContribution}
        />
      )}
    </div>
  )
}
