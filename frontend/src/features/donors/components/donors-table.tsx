"use client"
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
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Edit, Trash, MoreHorizontal, BookOpen, Printer } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteDonor } from "../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

export function DonorsTable({ data }: { data: any[] }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const router = useRouter()
  const { can } = useRbac()

  const canView = can("Donors", "View")
  const canEdit = can("Donors", "Edit")
  const canDelete = can("Donors", "Delete")

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "donorId",
      header: t("donors.table.donor_id"),
    },
    {
      accessorKey: "fullName",
      header: t("donors.table.name"),
    },
    {
      accessorKey: "mobile",
      header: t("donors.table.mobile"),
    },
    {
      accessorKey: "status",
      header: t("donors.table.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
          {row.original.status === "ACTIVE" ? t("donors.table.status_active") : row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const donor = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("donors.open_menu_64d2cc")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("donors.k_7c6fd8")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/donors/${donor.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> {t("donors.k_f61612")}</Link>
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/donors/${donor.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> {t("donors.k_8cdd29")}</Link>
                </DropdownMenuItem>
              )}
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/donors/ledger?donorId=${donor.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> {t("donors.k_800938")}</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => {
                      return (window.print());
                    }}>
                <Printer className="mr-2 h-4 w-4" /> {t("donors.k_a0b40f")}</DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    if (confirm(t("donors.table.confirm_delete"))) {
                      const res = await deleteDonor(donor.id)
                      if (res.success) {
                        toast.success(t("donors.k_9a80d2"))
                        router.refresh()
                      } else {
                        toast.error(res.error)
                      }
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" /> {t("donors.k_047838")}</DropdownMenuItem>
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
    state: { sorting, columnFilters },
  })

  return (
    <div>
      <div className="flex items-center py-2">
        <Input
          placeholder={t("donors.k_8434ad")}
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("fullName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
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
                  {t("donors.k_3f8ad2")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t("donors.k_8347d9")}</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t("donors.k_30ffb9")}</Button>
      </div>
    </div>
  )
}
