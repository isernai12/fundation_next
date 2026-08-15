"use client"
import { formatDate, formatCurrency } from "@/lib/format"

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
import type { Group } from "@prisma/client"
import { GroupFormDialog } from "./group-form-dialog"

import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Edit, Trash, Trash2, MoreHorizontal, ArrowUpDown, Building2, AlertTriangle, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { archiveGroup, deleteGroup, updateGroup } from "../actions"
import type { GroupWithCount } from "../types"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";
import { useRouter } from "next/navigation";

export function GroupsTable({ data, manageMode = false }: { data: GroupWithCount[], manageMode?: boolean }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [groupToDelete, setGroupToDelete] = useState<GroupWithCount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { can } = useRbac()

  const canView = can("Groups", "View")
  const canEdit = can("Groups", "Edit")
  const canDelete = can("Groups", "Delete")

  const columns: ColumnDef<GroupWithCount>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.table.columns.code")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.table.columns.name")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{row.getValue("name")}</span>
          {row.original.isFoundationGroup && (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-0 px-2 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>Foundation Central Fund</span>
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "_count.members",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.table.columns.members")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "currentFund",
      header: t("groups.table.columns.currentFund"),
      cell: ({ row }) => `৳${formatCurrency(row.original.currentFund || 0)}`,
    },
    {
      accessorKey: "memberSignupEnabled",
      header: "Member Signup",
      cell: ({ row }) => (
        row.original.memberSignupEnabled ? (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-[11px]">Allowed</Badge>
        ) : (
          <Badge variant="secondary" className="text-muted-foreground text-[11px]">Disabled</Badge>
        )
      ),
    },
    {
      accessorKey: "status",
      header: t("groups.table.columns.status"),
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "ACTIVE" ? "default" : "secondary"}>
          {row.getValue("status") === "ACTIVE" ? t("groups.table.status.active") : t("groups.table.status.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.table.columns.created")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const group = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("groups.table.actions.menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("groups.table.actions.menu")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/groups/${group.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> {t("groups.table.actions.view")}</Link>
                </DropdownMenuItem>
              )}
              {manageMode && (
                <>
                  {canEdit && (
                    <>
                      <GroupFormDialog
                        group={group}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => {
                              return (e.preventDefault());
                            }}>
                            <Edit className="mr-2 h-4 w-4" /> {t("groups.table.actions.edit")}</DropdownMenuItem>
                        }
                      />
                      {group.status === "INACTIVE" ? (
                        <DropdownMenuItem
                          onClick={async () => {
                            const payload = {
                              name: group.name,
                              code: group.code,
                              shortName: group.shortName || "",
                              description: group.description || "",
                              status: "ACTIVE" as const,
                              openingBalance: 0,
                              remarks: group.remarks || "",
                              memberSignupEnabled: group.memberSignupEnabled ?? true,
                              isFoundationGroup: group.isFoundationGroup ?? false,
                            }
                            const res = await updateGroup(group.id, payload)
                            if (res.success) {
                              toast.success(t("groups.table.activateSuccess"))
                              router.refresh()
                            } else {
                              toast.error(res.error)
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {t("groups.table.actions.activate")}</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={async () => {
                            const payload = {
                              name: group.name,
                              code: group.code,
                              shortName: group.shortName || "",
                              description: group.description || "",
                              status: "INACTIVE" as const,
                              openingBalance: 0,
                              remarks: group.remarks || "",
                              memberSignupEnabled: group.memberSignupEnabled ?? true,
                              isFoundationGroup: group.isFoundationGroup ?? false,
                            }
                            const res = await updateGroup(group.id, payload)
                            if (res.success) {
                              toast.success(t("groups.table.deactivateSuccess"))
                              router.refresh()
                            } else {
                              toast.error(res.error)
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {t("groups.table.actions.deactivate")}</DropdownMenuItem>
                      )}
                    </>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      disabled={group.isFoundationGroup}
                      onClick={() => {
                        if (group.isFoundationGroup) {
                          toast.error(t("groups.table.cannotDeleteFoundationGroup") || "The root Foundation Central Group cannot be deleted.");
                          return;
                        }
                        setGroupToDelete(group);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      {t("groups.table.actions.delete")}
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleHardDelete = async () => {
    if (!groupToDelete) return
    if (groupToDelete.isFoundationGroup) {
      toast.error(t("groups.table.cannotDeleteFoundationGroup") || "The root Foundation Central Group cannot be deleted.")
      setGroupToDelete(null)
      return
    }

    setIsDeleting(true)
    try {
      const res = await deleteGroup(groupToDelete.id)
      if (res.success) {
        toast.success(res.message || t("groups.table.hardDeleteSuccess"))
        setGroupToDelete(null)
        router.refresh()
      } else {
        toast.error(res.error || t("groups.table.hardDeleteFailed"))
      }
    } catch (err: any) {
      toast.error(err?.message || t("groups.table.hardDeleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

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
    <div>
      <div className="flex items-center py-2">
        <Input
          placeholder={t("groups.table.search")}
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                  {t("groups.table.emptyTitle")}</TableCell>
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
          {t("groups.table.pagination.previous")}</Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t("groups.table.pagination.next")}</Button>
      </div>

      {/* Hard Delete Confirmation Dialog */}
      <Dialog
        open={!!groupToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setGroupToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <DialogTitle className="text-xl">
                {t("groups.table.hardDeleteTitle") || "Permanently Delete Group"}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-sm text-foreground/80 font-medium">
              {t("groups.table.hardDeleteWarning") || "Warning: This is a permanent deletion. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {t("groups.table.hardDeleteDesc") || "The group itself and ALL data related to this group (members, transactions, loans, funds, and documents) will be permanently deleted from the database."}
            </p>

            {groupToDelete && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("groups.form.name") || "Group Name"}:</span>
                  <span className="font-semibold text-foreground">{groupToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("groups.form.code") || "Code"}:</span>
                  <span className="font-mono font-medium text-foreground">{groupToDelete.code}</span>
                </div>
                {groupToDelete._count?.members !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("groups.table.memberCount") || "Members"}:</span>
                    <span className="font-medium text-foreground">{groupToDelete._count.members}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              type="button"
              disabled={isDeleting}
              onClick={() => setGroupToDelete(null)}
            >
              {t("groups.table.cancelBtn") || t("groups.form.cancel") || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={isDeleting}
              onClick={handleHardDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("groups.table.deleting") || "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("groups.table.confirmHardDeleteBtn") || "Delete Permanently"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
