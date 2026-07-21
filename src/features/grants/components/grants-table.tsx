"use client"
import { formatCurrency, formatDate } from "@/lib/format"

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
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Edit, Eye, Trash, MoreHorizontal, Printer, Archive } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Grant, FundAllocation, Fund } from "@prisma/client"
import { deleteGrant } from "../actions"
import { toast } from "sonner"
import Link from "next/link"

type GrantWithDetails = Grant & {
  beneficiary: {
    fullName: string | null
    
    beneficiaryId: string
  }
  allocations: (FundAllocation & {
    fund: Fund & {
      group: { name: string; code: string } | null
    }
  })[]
}

export function GrantsTable({ data, manageMode = false }: { data: GrantWithDetails[], manageMode?: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<GrantWithDetails>[] = [
    {
      accessorKey: "grantNumber",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
            অনুদান নম্বর <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: "beneficiary",
      header: "সুবিধাভোগী",
      cell: ({ row }) => `${row.original.beneficiary.fullName || 'নাম পাওয়া যায়নি'} (${row.original.beneficiary.beneficiaryId})`
    },
    {
      accessorKey: "purpose",
      header: "কারণ",
    },
    {
      accessorKey: "amount",
      header: "পরিমাণ",
      cell: ({ row }) => `৳${formatCurrency(row.original.amount)}`
    },
    {
      accessorKey: "dateApproved",
      header: "তারিখ",
      cell: ({ row }) => row.original.dateApproved ? formatDate(row.original.dateApproved) : "N/A"
    },
    {
      accessorKey: "status",
      header: "অবস্থা",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "PAID" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const grant = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">মেনু খুলুন</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/grants/${grant.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                </Link>
              </DropdownMenuItem>
              {manageMode && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/grants/${grant.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="mr-2 h-4 w-4" /> প্রিন্ট
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" /> আর্কাইভ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("আপনি কি নিশ্চিত যে এই অনুদানটি মুছে ফেলতে চান?")) {
                        const res = await deleteGrant(grant.id)
                        if (res.success) toast.success("অনুদান মুছে ফেলা হয়েছে")
                        else toast.error(res.error || "অনুদান মুছতে ব্যর্থ হয়েছে")
                      }
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" /> মুছে ফেলুন
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
      <div className="rounded-md border bg-card mt-4">
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
                  No grants found.
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
