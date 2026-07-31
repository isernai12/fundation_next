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
    if (!confirm("Are you sure you want to delete this contribution? This will permanently remove the record and reverse all associated ledger entries. This action cannot be undone.")) return;
    
    const res = await deleteContribution(id)
    if (res.success) {
      toast.success(t("contributions.deleted_5fe600"), { description: "Contribution and ledger entries reversed." })
    } else {
      toast.error(t("contributions.error_902b0d"), { description: res.error })
    }
  }

  const handleStatusUpdate = async (contribution: ContributionWithDetails, newStatus: string) => {
    // If we're marking as paid but it has no payment details, we can't do it blindly. We should prompt them to edit instead.
    if (newStatus === "PAID" && contribution.payments.length === 0) {
      toast.info(t("contributions.missing_details_75ebc6"), { description: "Please use 'Edit' to enter payment amount and date." })
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
      toast.success(t("contributions.status_updated_858f68"), { description: `Contribution marked as ${newStatus}.` })
    } else {
      toast.error(t("contributions.error_902b0d"), { description: res.error })
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
      header: "Member",
    },
    {
      accessorFn: (row) => row.member.group?.name || "N/A",
      id: "group",
      header: "Group",
    },
    {
      accessorFn: (row) => `${formatShortMonth(row.month - 1)} ${row.year}`,
      id: "period",
      header: "Period",
    },
    {
      accessorKey: "expectedAmount",
      header: "Amount",
      cell: ({ row }) => `৳${(row.getValue("expectedAmount") as number)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "PAID" ? "default" : "destructive"}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "isAdditional",
      header: "Type",
      cell: ({ row }) => {
        return (row.getValue("isAdditional") ? <Badge variant="outline">{t("contributions.additional_27b948")}</Badge> : <Badge variant="outline">{t("contributions.standard_eb6d8a")}</Badge>);
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
                <span className="sr-only">{t("contributions.open_menu_64d2cc")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("contributions.actions_06df33")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem onClick={() => setViewingContribution(contribution)}>
                  <Eye className="mr-2 h-4 w-4" /> {t("contributions.view_details_5d5cd2")}</DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditingContribution(contribution)}>
                  <Edit className="mr-2 h-4 w-4" /> {t("contributions.edit_contribution_bfb6c5")}</DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              {canEdit && contribution.status !== "PAID" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(contribution, "PAID")}>
                  <CheckCircle className="mr-2 h-4 w-4" /> {t("contributions.mark_as_paid_cb5e3a")}</DropdownMenuItem>
              )}
              {canEdit && contribution.status !== "PENDING" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(contribution, "PENDING")}>
                  <Clock className="mr-2 h-4 w-4" /> {t("contributions.mark_as_pending_400d2b")}</DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => {
                      return (window.print());
                    }}>
                <Printer className="mr-2 h-4 w-4" /> {t("contributions.print_receipt_334d94")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                      return (window.print());
                    }}>
                <Download className="mr-2 h-4 w-4" /> {t("contributions.download_pdf_260729")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/members/${contribution.memberId}`)}>
                <FileText className="mr-2 h-4 w-4" /> {t("contributions.view_member_profile_5f663c")}</DropdownMenuItem>
              
              <DropdownMenuSeparator />

              <DropdownMenuItem 
                onClick={() => {
                  if (contribution.payments.length > 0) {
                    toast.success(t("contributions.ledger_entry_0e2e6a"), { description: `Ledger Transaction ID: ${contribution.payments[0].ledgerTransactionId}` })
                  } else {
                    toast.error(t("contributions.no_payment_4bc4e1"), { description: "There is no ledger entry for unpaid contributions." })
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> {t("contributions.view_ledger_entry_b1b111")}</DropdownMenuItem>
              
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(contribution.id)} className="text-red-600 focus:text-red-600">
                    <Trash className="mr-2 h-4 w-4" /> {t("contributions.delete_contribution_c726ce")}</DropdownMenuItem>
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
            placeholder={t("contributions.filter_members_4805e8")}
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
              <Printer className="mr-2 h-4 w-4" /> {t("contributions.print_selected_cb4716")}</Button>
            <Button variant="outline" size="sm" onClick={() => {
                        return (window.print());
                      }}>
              <Download className="mr-2 h-4 w-4" /> {t("contributions.export_pdf_af8070")}</Button>
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
                  {t("contributions.no_contributions_fou_eeb7f2")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} {t("contributions.row_s_selected_b5c5c5")}</div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            {t("contributions.previous_dd1f77")}</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            {t("contributions.next_10ac3d")}</Button>
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
