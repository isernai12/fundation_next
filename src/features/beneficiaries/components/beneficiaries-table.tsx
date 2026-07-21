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
import { Beneficiary, Member } from "@prisma/client"

type BeneficiaryWithMember = Beneficiary & { 
  member?: { 
    memberId: string
    fullName: string | null
    
  } | null 
}

export function BeneficiariesTable({ data, members, manageMode = false }: { data: BeneficiaryWithMember[], members: { id: string; fullName: string | null; memberId: string }[], manageMode?: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<BeneficiaryWithMember>[] = [
    {
      accessorKey: "beneficiaryId",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            Beneficiary ID <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            Name <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => `${row.original.fullName || 'নাম পাওয়া যায়নি'}`
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
    },
    {
      id: "linkedMember",
      header: "Linked Member",
      cell: ({ row }) => row.original.member ? `${row.original.member.fullName || 'নাম পাওয়া যায়নি'} (${row.original.member.memberId})` : "None"
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
      id: "actions",
      cell: ({ row }) => {
        const beneficiary = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/beneficiaries/${beneficiary.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
              {manageMode && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/beneficiaries/${beneficiary.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Beneficiary
                    </Link>
                  </DropdownMenuItem>
                  {beneficiary.status === "INACTIVE" ? (
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
                        if (res.success) toast.success("Beneficiary activated")
                        else toast.error(res.error)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Activate
                    </DropdownMenuItem>
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
                        if (res.success) toast.success("Beneficiary deactivated")
                        else toast.error(res.error)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Deactivate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this beneficiary?")) {
                        const res = await deleteBeneficiary(beneficiary.id)
                        if (res.success) toast.success("Beneficiary deleted")
                        else toast.error(res.error)
                      }
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
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
      <div className="flex items-center space-x-2 py-4">
        <Input
          placeholder="Search by first name..."
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
            {table.getHeaderGroups().map((headerGroup) => (
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
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No beneficiaries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
