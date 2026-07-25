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
import { Member, Group } from "@prisma/client"
import { MemberFormDialog } from "./member-form-dialog"
import { toggleMemberStatus, deleteMember } from "../actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Edit, Trash, MoreHorizontal, Power, PowerOff, BookOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MemberWithGroup = Member & {
  group: { name: string; code: string } | null
}

export function MembersTable({ data, groups, isManage = false }: { data: MemberWithGroup[], groups: Group[], isManage?: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<MemberWithGroup>[] = [
    {
      accessorKey: "memberId",
      header: "সদস্য আইডি",
    },
    {
      accessorKey: "fullName",
      header: "নাম",
      cell: ({ row }) => `${row.original.fullName || 'নাম পাওয়া যায়নি'}`
    },
    {
      accessorKey: "groupId",
      header: "গ্রুপ",
      cell: ({ row }) => row.original.group ? `${row.original.group.name} (${row.original.group.code})` : "None",
    },
    {
      accessorKey: "mobile",
      header: "মোবাইল",
    },
    {
      accessorKey: "status",
      header: "অবস্থা",
      cell: ({ row }) => {
        const status = row.original.status
        let variant: "default" | "secondary" | "destructive" | "outline" = "default"
        if (status === "ACTIVE") variant = "default"
        if (status === "INACTIVE") variant = "secondary"
        if (status === "SUSPENDED") variant = "destructive"
        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "joinDate",
      header: "যোগদানের তারিখ",
      cell: ({ row }) => row.original.joinDate ? formatDate(row.original.joinDate) : 'N/A',
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original
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
                <Link href={`/members/${member.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/members/${member.id}/dues`}>
                  <BookOpen className="mr-2 h-4 w-4" /> চাঁদার তথ্য
                </Link>
              </DropdownMenuItem>
              {isManage && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/members/${member.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> সদস্য সম্পাদনা করুন
                    </Link>
                  </DropdownMenuItem>
                  
                  {member.status === "ACTIVE" ? (
                    <DropdownMenuItem
                      onClick={async () => {
                        if (confirm("আপনি কি নিশ্চিত যে আপনি এই সদস্যকে নিষ্ক্রিয় করতে চান?")) {
                          const res = await toggleMemberStatus(member.id, "INACTIVE")
                          if (res.success) toast.success("সদস্য নিষ্ক্রিয় করা হয়েছে")
                          else toast.error(res.error)
                        }
                      }}
                    >
                      <PowerOff className="mr-2 h-4 w-4" /> নিষ্ক্রিয় করুন
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={async () => {
                        if (confirm("আপনি কি নিশ্চিত যে আপনি এই সদস্যকে সক্রিয় করতে চান?")) {
                          const res = await toggleMemberStatus(member.id, "ACTIVE")
                          if (res.success) toast.success("সদস্য সক্রিয় করা হয়েছে")
                          else toast.error(res.error)
                        }
                      }}
                    >
                      <Power className="mr-2 h-4 w-4" /> সক্রিয় করুন
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("আপনি কি নিশ্চিত যে আপনি এই সদস্যকে স্থায়ীভাবে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।")) {
                        const res = await deleteMember(member.id)
                        if (res.success) toast.success("সদস্য সফলভাবে মুছে ফেলা হয়েছে")
                        else toast.error(res.error)
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
      <div className="flex items-center space-x-2 py-4">
        <Input
          placeholder="নাম দিয়ে খুঁজুন..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        {/* Simple Group Filter Dropdown */}
        <Select 
          value={(table.getColumn("groupId")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") table.getColumn("groupId")?.setFilterValue("")
            else table.getColumn("groupId")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="গ্রুপ দিয়ে ফিল্টার করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সকল গ্রুপ</SelectItem>
            {groups.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
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
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  কোনো ফলাফল পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          পূর্ববর্তী
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          পরবর্তী
        </Button>
      </div>
    </div>
  )
}
