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
import { Eye, Edit, Trash, MoreHorizontal, ArrowUpDown, Building2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { archiveGroup, deleteGroup, updateGroup } from "../actions"
import type { GroupWithCount } from "../types"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

export function GroupsTable({ data, manageMode = false }: { data: GroupWithCount[], manageMode?: boolean }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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
                            if (res.success) toast.success(t("groups.table.activateSuccess"))
                            else toast.error(res.error)
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
                            if (res.success) toast.success(t("groups.table.deactivateSuccess"))
                            else toast.error(res.error)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {t("groups.table.actions.deactivate")}</DropdownMenuItem>
                      )}
                    </>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (confirm(t("groups.table.archiveConfirm"))) {
                            const res = await archiveGroup(group.id)
                            if (res.success) toast.success(t("groups.table.archiveSuccess"))
                            else toast.error(res.error)
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" /> {t("groups.table.actions.archive")}</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm(t("groups.table.deleteConfirm"))) {
                            const res = await deleteGroup(group.id)
                            if (res.success) toast.success(t("groups.table.deleteSuccess"))
                            else toast.error(res.error)
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" /> {t("groups.table.actions.delete")}</DropdownMenuItem>
                    </>
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
    </div>
  )
}
