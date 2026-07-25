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

export function DonorsTable({ data }: { data: any[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const router = useRouter()

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "donorId",
      header: "অনুদানদাতা আইডি",
    },
    {
      accessorKey: "fullName",
      header: "নাম",
    },
    {
      accessorKey: "mobile",
      header: "মোবাইল",
    },
    {
      accessorKey: "status",
      header: "অবস্থা",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
          {row.original.status === "ACTIVE" ? "সক্রিয়" : row.original.status}
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/donors/${donor.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/donors/${donor.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/donors/ledger?donorId=${donor.id}`}>
                  <BookOpen className="mr-2 h-4 w-4" /> লেজার
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> প্রিন্ট
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={async () => {
                  if (confirm("আপনি কি নিশ্চিত যে আপনি এই অনুদানদাতাকে মুছে ফেলতে চান?")) {
                    const res = await deleteDonor(donor.id)
                    if (res.success) {
                      toast.success("সফলভাবে মুছে ফেলা হয়েছে")
                      router.refresh()
                    } else {
                      toast.error(res.error)
                    }
                  }
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> মুছুন
              </DropdownMenuItem>
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
      <div className="flex items-center py-4">
        <Input
          placeholder="নাম দিয়ে খুঁজুন..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("fullName")?.setFilterValue(event.target.value)}
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  কোনো অনুদানদাতা পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          পূর্ববর্তী
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          পরবর্তী
        </Button>
      </div>
    </div>
  )
}
