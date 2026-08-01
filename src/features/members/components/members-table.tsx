"use client"

import { formatDate } from "@/lib/format"
import { useState, useEffect } from "react"
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
import type { Member, Group } from "@prisma/client"
import { toggleMemberStatus, deleteMember, restoreMember } from "../actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Power,
  PowerOff,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Download
} from "lucide-react"
import { useRbac } from "@/components/providers/rbac-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/i18n/LanguageProvider";

type MemberWithGroup = Member & {
  group: { name: string; code: string } | null
}

export function MembersTable({ data, groups, isManage = false }: { data: MemberWithGroup[], groups: Group[], isManage?: boolean }) {
    const { t } = useLanguage();
  const [tableData, setTableData] = useState<MemberWithGroup[]>(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Keep tableData updated when prop changes
  useEffect(() => {
    setTableData(data)
  }, [data])

  // Confirmation modal states
  const [statusConfirmMember, setStatusConfirmMember] = useState<MemberWithGroup | null>(null)
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<MemberWithGroup | null>(null)
  const [restoreConfirmMember, setRestoreConfirmMember] = useState<MemberWithGroup | null>(null)

  // Reason form state
  const [selectedReason, setSelectedReason] = useState<string>("Temporary inactive")
  const [customNote, setCustomNote] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { can, permissions } = useRbac()
  const isSuperAdmin = permissions.includes("*")
  const canView = can("Members", "View")
  const canEdit = can("Members", "Edit")
  const canDelete = can("Members", "Delete")
  const canViewLedger = can("Reports", "View") || canView

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirmMember) return
    const memberId = statusConfirmMember.id
    const currentStatus = statusConfirmMember.status
    const targetStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"

    const reasonText = currentStatus === "ACTIVE"
      ? (selectedReason === "Other" ? (customNote || "Other") : selectedReason)
      : (customNote || "Member Reactivated");

    setIsSubmitting(true)

    // Optimistic Update: Update badge instantly
    setTableData(prev =>
      prev.map(m => (m.id === memberId ? { ...m, status: targetStatus } : m))
    )

    const res = await toggleMemberStatus(memberId, targetStatus, reasonText, customNote)
    setIsSubmitting(false)
    setStatusConfirmMember(null)
    setCustomNote("")

    if (res.success) {
      toast.success(
        targetStatus === "ACTIVE"
          ? t("members.messages.activated_success")
          : t("members.messages.deactivated_success")
      )
    } else {
      // Revert state if failed
      setTableData(prev =>
        prev.map(m => (m.id === memberId ? { ...m, status: currentStatus } : m))
      )
      toast.error(res.error ? t(res.error) : t("members.messages.status_change_error"))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmMember) return
    const memberId = deleteConfirmMember.id
    const backupMember = deleteConfirmMember

    setIsSubmitting(true)

    // Optimistic Update: Mark as DELETED or remove if filtered
    setTableData(prev => prev.filter(m => m.id !== memberId))

    const res = await deleteMember(memberId)
    setIsSubmitting(false)
    setDeleteConfirmMember(null)

    if (res.success) {
      toast.success(t("members.messages.delete_success"))
    } else {
      // Revert if error
      setTableData(prev => [backupMember, ...prev])
      toast.error(res.error ? t(res.error) : t("members.messages.delete_error"))
    }
  }

  const handleConfirmRestore = async () => {
    if (!restoreConfirmMember) return
    const memberId = restoreConfirmMember.id

    setIsSubmitting(true)

    setTableData(prev =>
      prev.map(m => (m.id === memberId ? { ...m, status: "ACTIVE" } : m))
    )

    const res = await restoreMember(memberId, customNote || "Restored by Super Admin")
    setIsSubmitting(false)
    setRestoreConfirmMember(null)
    setCustomNote("")

    if (res.success) {
      toast.success(t("members.messages.restore_success"))
    } else {
      toast.error(res.error ? t(res.error) : t("members.messages.restore_error"))
    }
  }

  const columns: ColumnDef<MemberWithGroup>[] = [
    {
      accessorKey: "memberId",
      header: t("members.table.member_id"),
    },
    {
      accessorKey: "fullName",
      header: t("members.table.name"),
      cell: ({ row }) => `${row.original.fullName || ''}`
    },
    {
      accessorKey: "groupId",
      header: t("members.table.group"),
      cell: ({ row }) => row.original.group ? `${row.original.group.name} (${row.original.group.code})` : "None",
    },
    {
      accessorKey: "mobile",
      header: t("members.table.mobile"),
    },
    {
      accessorKey: "status",
      header: t("members.table.status"),
      cell: ({ row }) => {
        const status = row.original.status
        if (status === "ACTIVE") {
          return (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              {t("members.status.active_caps")}</Badge>
          )
        }
        if (status === "INACTIVE") {
          return (
            <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              {t("members.status.inactive_caps")}</Badge>
          )
        }
        return <Badge variant="destructive">{status}</Badge>
      },
    },
    {
      accessorKey: "joinDate",
      header: t("members.table.join_date"),
      cell: ({ row }) => row.original.joinDate ? formatDate(row.original.joinDate) : 'N/A',
    },
    {
      id: "actions",
      header: () => {
        return (<div className="text-right">{t("members.table.actions")}</div>);
      },
      cell: ({ row }) => {
        const member = row.original

        const showView = canView
        const showEdit = canEdit && member.status !== "DELETED"
        const showLedger = canViewLedger
        const showStatusToggle = canEdit && member.status !== "DELETED"
        const showDelete = canDelete && member.status !== "DELETED"
        const showRestore = isSuperAdmin && member.status === "DELETED"

        const hasAnyAction = showView || showEdit || showLedger || showStatusToggle || showDelete || showRestore

        if (!hasAnyAction) return null

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">{t("members.actions.open_menu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  {t("members.table.actions_label")}</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* 1. View Details */}
                {showView && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/members/${member.id}`} className="cursor-pointer flex items-center">
                        <Eye className="mr-2 h-4 w-4 text-blue-500" />
                        <span>{t("members.actions.view_profile")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/api/members/${member.id}/registration-form`} target="_blank" className="cursor-pointer flex items-center">
                        <Download className="mr-2 h-4 w-4 text-purple-500" />
                        <span>{t("members.actions.download_registration_form")}</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {/* 2. Edit Member */}
                {showEdit && (
                  <DropdownMenuItem asChild>
                    <Link href={`/members/${member.id}/edit`} className="cursor-pointer flex items-center">
                      <Edit className="mr-2 h-4 w-4 text-amber-500" />
                      <span>{t("members.actions.edit_member")}</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* 3. Member Ledger */}
                {showLedger && (
                  <DropdownMenuItem asChild>
                    <Link href={`/members/ledger?memberId=${member.id}`} className="cursor-pointer flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>{t("members.actions.ledger")}</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* 4. Active / Deactivate */}
                {showStatusToggle && (
                  <>
                    <DropdownMenuSeparator />
                    {member.status === "ACTIVE" ? (
                      <DropdownMenuItem
                        className="cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-600"
                        onClick={() => {
                          setSelectedReason("Temporary inactive")
                          setStatusConfirmMember(member)
                        }}
                      >
                        <PowerOff className="mr-2 h-4 w-4 text-amber-500" />
                        <span>{t("members.actions.deactivate_menu")}</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer text-emerald-600 dark:text-emerald-400 focus:text-emerald-600"
                        onClick={() => {
                          setSelectedReason("")
                          setStatusConfirmMember(member)
                        }}
                      >
                        <Power className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>{t("members.actions.activate_menu")}</span>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {/* Restore for Super Admin */}
                {showRestore && (
                  <DropdownMenuItem
                    className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                    onClick={() => setRestoreConfirmMember(member)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>{t("members.actions.restore_menu")}</span>
                  </DropdownMenuItem>
                )}

                {/* 5. Delete Member */}
                {showDelete && (
                  <>
                    {!showStatusToggle && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => setDeleteConfirmMember(member)}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      <span>{t("members.actions.delete_menu")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: tableData,
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
    <div>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 py-2">
        <Input
          placeholder={t("members.table.search_placeholder")}
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        {/* Status Filter */}
        <Select 
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") table.getColumn("status")?.setFilterValue("")
            else table.getColumn("status")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("members.table.status_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("members.table.all_status")}</SelectItem>
            <SelectItem value="ACTIVE">{t("members.status.active")}</SelectItem>
            <SelectItem value="INACTIVE">{t("members.status.inactive")}</SelectItem>
            {isSuperAdmin && <SelectItem value="DELETED">{t("members.status.deleted")}</SelectItem>}
          </SelectContent>
        </Select>

        {/* Group Filter */}
        <Select 
          value={(table.getColumn("groupId")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") table.getColumn("groupId")?.setFilterValue("")
            else table.getColumn("groupId")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("members.table.group_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("members.table.all_groups")}</SelectItem>
            {groups.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("members.table.no_results")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t("members.table.previous")}</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("members.table.next")}</Button>
      </div>

      {/* Confirmation Dialog: Status Toggle (Deactivate / Activate) */}
      <Dialog open={!!statusConfirmMember} onOpenChange={(open) => !open && setStatusConfirmMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusConfirmMember?.status === "ACTIVE" ? (
                <>
                  <PowerOff className="h-5 w-5 text-amber-500" />
                  <span>{t("members.dialog.deactivate_title")}</span>
                </>
              ) : (
                <>
                  <Power className="h-5 w-5 text-emerald-500" />
                  <span>{t("members.dialog.activate_title")}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="py-2 text-sm text-muted-foreground leading-relaxed">
              {statusConfirmMember?.status === "ACTIVE" ? (
                <>
                  {t("members.dialog.status_confirm_prefix")}<strong>{statusConfirmMember?.fullName}</strong> ({statusConfirmMember?.memberId}{t("members.dialog.status_confirm_mid1")}<strong>{t("members.dialog.inactive_strong")}</strong> {t("members.dialog.status_confirm_suffix")}<br className="my-1" />
                  {t("members.dialog.deactivate_warning")}</>
              ) : (
                <>
                  {t("members.dialog.status_confirm_prefix")}<strong>{statusConfirmMember?.fullName}</strong> ({statusConfirmMember?.memberId}{t("members.dialog.status_confirm_mid2")}<strong>{t("members.dialog.active_strong")}</strong> {t("members.dialog.status_confirm_suffix")}<br className="my-1" />
                  {t("members.dialog.activate_warning")}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {statusConfirmMember?.status === "ACTIVE" ? (
              <div className="space-y-1.5">
                <Label htmlFor="deactivate-reason">{t("members.dialog.reason_label")}</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger id="deactivate-reason">
                    <SelectValue placeholder={t("members.dialog.select_reason")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Left the foundation">{t("members.reasons.left")}</SelectItem>
                    <SelectItem value="Transferred">{t("members.reasons.transferred")}</SelectItem>
                    <SelectItem value="Deceased">{t("members.reasons.deceased")}</SelectItem>
                    <SelectItem value="Temporary inactive">{t("members.reasons.temp_inactive")}</SelectItem>
                    <SelectItem value="Other">{t("members.reasons.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {(selectedReason === "Other" || statusConfirmMember?.status !== "ACTIVE") && (
              <div className="space-y-1.5">
                <Label htmlFor="custom-reason">{t("members.dialog.custom_note_label")}</Label>
                <Input
                  id="custom-reason"
                  placeholder={t("members.dialog.custom_note_placeholder")}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" onClick={() => setStatusConfirmMember(null)} disabled={isSubmitting}>
              {t("members.actions.cancel")}</Button>
            <Button
              variant={statusConfirmMember?.status === "ACTIVE" ? "destructive" : "default"}
              onClick={handleConfirmStatusToggle}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("members.actions.processing") : statusConfirmMember?.status === "ACTIVE" ? t("members.actions.deactivate") : t("members.actions.activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Soft Delete */}
      <Dialog open={!!deleteConfirmMember} onOpenChange={(open) => !open && setDeleteConfirmMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>{t("members.dialog.delete_title")}</span>
            </DialogTitle>
            <DialogDescription className="space-y-3 py-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                {t("members.dialog.delete_confirm_prefix")}<strong>{deleteConfirmMember?.fullName}</strong> ({deleteConfirmMember?.memberId}{t("members.dialog.delete_confirm_suffix")}</p>
              <div className="rounded-md bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs border border-amber-500/20">
                ⚠️ <strong>{t("members.messages.warning")}</strong> {t("members.messages.soft_delete_warning")}</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmMember(null)} disabled={isSubmitting}>
              {t("members.actions.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("members.actions.processing") : t("members.actions.soft_delete_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Restore */}
      <Dialog open={!!restoreConfirmMember} onOpenChange={(open) => !open && setRestoreConfirmMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
              <span>{t("members.dialog.restore_title")}</span>
            </DialogTitle>
            <DialogDescription className="py-2 text-sm text-muted-foreground leading-relaxed">
              {t("members.dialog.restore_confirm_prefix")}<strong>{restoreConfirmMember?.fullName}</strong>{t("members.dialog.restore_confirm_suffix")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" onClick={() => setRestoreConfirmMember(null)} disabled={isSubmitting}>
              {t("members.actions.cancel")}</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmRestore}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("members.actions.processing") : t("members.actions.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
