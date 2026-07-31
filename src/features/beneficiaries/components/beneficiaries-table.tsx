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

import { Eye, Edit, Trash, MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { deleteBeneficiary, updateBeneficiary } from "../actions"
import { toast } from "sonner"
import type { Beneficiary, Member } from "@prisma/client"
import { useRbac } from "@/components/providers/rbac-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

type BeneficiaryWithMember = Beneficiary & { 
  member?: { 
    memberId: string
    fullName: string | null
    
  } | null 
}

export function BeneficiariesTable({ data, members, manageMode = false }: { data: BeneficiaryWithMember[], members: { id: string; fullName: string | null; memberId: string }[], manageMode?: boolean }) {
    const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const { can } = useRbac()

  const canView = can("Beneficiaries", "View")
  const canEdit = can("Beneficiaries", "Edit")
  const canDelete = can("Beneficiaries", "Delete")

  const columns: ColumnDef<BeneficiaryWithMember>[] = [
    {
      accessorKey: "beneficiaryId",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("beneficiaries.table.beneficiary_id")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            {t("beneficiaries.table.name")}<ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => `${row.original.fullName || t("beneficiaries.table.name_not_found")}`
    },
    {
      header: "Full Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("fullName")}</div>,
    },
    {
      accessorKey: "relationToMember",
      header: "Relation / Type",
      cell: ({ row }) => <div>{row.getValue("relationToMember") || "N/A"}</div>,
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.phone || row.original.mobile || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const beneficiary = row.original
        const hasAnyAction = canView || canEdit || canDelete
        if (!hasAnyAction) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("beneficiaries.table.open_menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("beneficiaries.table.actions")}</DropdownMenuLabel>
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/beneficiaries/${beneficiary.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> {t("beneficiaries.table.view_details")}</Link>
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/beneficiaries/${beneficiary.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> {t("beneficiaries.table.edit")}</Link>
                </DropdownMenuItem>
              )}
              {canEdit && (
                beneficiary.status === "INACTIVE" ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      const payload = {
                        fullName: beneficiary.fullName,
                        memberId: beneficiary.memberId || "",
                        relationToMember: beneficiary.relationToMember || "",
                        email: beneficiary.email || "",
                        phone: beneficiary.phone || "",
                        mobile: beneficiary.mobile || "",
                        address: beneficiary.address || "",
                        nationalId: beneficiary.nationalId || "",
                        occupation: beneficiary.occupation || "",
                        remarks: beneficiary.remarks || "",
                        status: "ACTIVE" as const,
                      }
                      const res = await updateBeneficiary(beneficiary.id, payload)
                      if (res.success) toast.success(t("beneficiaries.messages.activate_success"))
                      else toast.error(res.error)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" /> {t("beneficiaries.table.activate")}</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={async () => {
                      const payload = {
                        fullName: beneficiary.fullName,
                        memberId: beneficiary.memberId || "",
                        relationToMember: beneficiary.relationToMember || "",
                        email: beneficiary.email || "",
                        phone: beneficiary.phone || "",
                        mobile: beneficiary.mobile || "",
                        address: beneficiary.address || "",
                        nationalId: beneficiary.nationalId || "",
                        occupation: beneficiary.occupation || "",
                        remarks: beneficiary.remarks || "",
                        status: "INACTIVE" as const,
                      }
                      const res = await updateBeneficiary(beneficiary.id, payload)
                      if (res.success) toast.success(t("beneficiaries.messages.deactivate_success"))
                      else toast.error(res.error)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" /> {t("beneficiaries.table.deactivate")}</DropdownMenuItem>
                )
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this beneficiary?")) {
                      const res = await deleteBeneficiary(beneficiary.id)
                      if (res.success) toast.success(t("beneficiaries.messages.delete_success"))
                      else toast.error(res.error)
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" /> {t("beneficiaries.table.delete")}</DropdownMenuItem>
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
      <div className="flex items-center space-x-2 py-2">
        <Input
          placeholder={t("beneficiaries.table.search_placeholder")}
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t("beneficiaries.table.no_results")}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t("beneficiaries.table.previous")}</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t("beneficiaries.table.next")}</Button>
      </div>
    </div>
  )
}
