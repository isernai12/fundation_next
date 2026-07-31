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
import { Eye, Edit, Trash, MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { archiveGroup, deleteGroup, updateGroup } from "../actions"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

type GroupWithCount = Group & { _count: { members: number }, currentFund?: number }

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
            {t("groups.code_ca0dba")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.name_49ee30")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "_count.members",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.members_ef5353")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "currentFund",
      header: "Current Fund",
      cell: ({ row }) => `৳${formatCurrency(row.original.currentFund || 0)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "ACTIVE" ? "default" : "secondary"}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("groups.created_0eceeb")}<ArrowUpDown className="ml-2 h-4 w-4" />
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
                <span className="sr-only">{t("groups.open_menu_64d2cc")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("groups.actions_06df33")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/groups/${group.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> {t("groups.view_details_5d5cd2")}</Link>
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
                            <Edit className="mr-2 h-4 w-4" /> {t("groups.edit_group_379d5e")}</DropdownMenuItem>
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
                            }
                            const res = await updateGroup(group.id, payload)
                            if (res.success) toast.success(t("groups.group_activated_5e8bd2"))
                            else toast.error(res.error)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {t("groups.activate_a13367")}</DropdownMenuItem>
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
                            }
                            const res = await updateGroup(group.id, payload)
                            if (res.success) toast.success(t("groups.group_deactivated_cacd8e"))
                            else toast.error(res.error)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {t("groups.deactivate_109fec")}</DropdownMenuItem>
                      )}
                    </>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (confirm("Are you sure you want to archive this group?")) {
                            const res = await archiveGroup(group.id)
                            if (res.success) toast.success(t("groups.group_archived_43d642"))
                            else toast.error(res.error)
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" /> {t("groups.archive_e727b0")}</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm("Are you sure you want to fully delete this group? This cannot be undone.")) {
                            const res = await deleteGroup(group.id)
                            if (res.success) toast.success(t("groups.group_deleted_694267"))
                            else toast.error(res.error)
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" /> {t("groups.delete_f2a6c4")}</DropdownMenuItem>
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
          placeholder={t("groups.search_groups_70c637")}
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
                  {t("groups.no_results_3b8769")}</TableCell>
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
