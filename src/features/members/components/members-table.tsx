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
      header: "Member ID",
    },
    {
      accessorKey: "fullName",
      header: "Name",
      cell: ({ row }) => `${row.original.fullName || 'নাম পাওয়া যায়নি'}`
    },
    {
      accessorKey: "groupId",
      header: "Group",
      cell: ({ row }) => row.original.group ? `${row.original.group.name} (${row.original.group.code})` : "None",
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
    },
    {
      accessorKey: "status",
      header: "Status",
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
      header: "Joined",
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/members/${member.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
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
                      <Edit className="mr-2 h-4 w-4" /> Edit Member
                    </Link>
                  </DropdownMenuItem>
                  
                  {member.status === "ACTIVE" ? (
                    <DropdownMenuItem
                      onClick={async () => {
                        if (confirm("Are you sure you want to deactivate this member?")) {
                          const res = await toggleMemberStatus(member.id, "INACTIVE")
                          if (res.success) toast.success("Member deactivated")
                          else toast.error(res.error)
                        }
                      }}
                    >
                      <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={async () => {
                        if (confirm("Are you sure you want to activate this member?")) {
                          const res = await toggleMemberStatus(member.id, "ACTIVE")
                          if (res.success) toast.success("Member activated")
                          else toast.error(res.error)
                        }
                      }}
                    >
                      <Power className="mr-2 h-4 w-4" /> Activate
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to permanently delete this member? This action cannot be undone.")) {
                        const res = await deleteMember(member.id)
                        if (res.success) toast.success("Member deleted successfully")
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
        
        {/* Simple Group Filter Dropdown */}
        <Select 
          value={(table.getColumn("groupId")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") table.getColumn("groupId")?.setFilterValue("")
            else table.getColumn("groupId")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Groups</SelectItem>
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
                  No results.
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
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
