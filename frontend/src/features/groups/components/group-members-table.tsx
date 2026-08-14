"use client"
import { formatDate } from "@/lib/format"

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
import type { Member } from "@prisma/client"
import { removeMemberFromGroup } from "../actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Trash, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/i18n/LanguageProvider";

export function GroupMembersTable({ data }: { data: Member[] }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "memberId",
      header: t("groups.table.columns.memberId"),
    },
    {
      id: "name",
      header: t("groups.table.columns.name"),
      cell: ({ row }) => `${row.original.fullName || t("groups.table.nameNotFound")}`,
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
      id: "contributionStatus",
      header: t("groups.table.columns.contribution"),
      cell: () => {
        return (<Badge variant="outline">{t("groups.table.status.upToDate")}</Badge>);
      }, // Placeholder
    },
    {
      accessorKey: "joinDate",
      header: t("groups.table.columns.joinDate"),
      cell: ({ row }) => row.original.joinDate ? formatDate(row.original.joinDate) : "N/A",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original
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
              <DropdownMenuItem asChild>
                <Link href={`/members/${member.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> {t("groups.table.actions.viewMember")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={async () => {
                  if (confirm(t("groups.table.actions.removeConfirm"))) {
                    const res = await removeMemberFromGroup(member.id)
                    if (res.success) toast.success(t("groups.table.actions.removeSuccess"))
                    else toast.error(res.error)
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> {t("groups.table.actions.removeMember")}</DropdownMenuItem>
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
          placeholder={t("groups.table.searchMembers")}
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
                  {t("groups.table.noMembersFound")}</TableCell>
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
