"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, FileText, Download, Printer, Eye, Edit, Trash, Search, FilterX, Users, Building } from "lucide-react"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import { deleteDonationTransaction, type DonationTransactionItem } from "../actions"
import { ViewDonationDialog } from "./view-donation-dialog"
import { EditDonationSheet } from "./edit-donation-sheet"
import { ReceiptDonationModal } from "./receipt-donation-modal"

interface DonationsTableProps {
  data: DonationTransactionItem[]
  donors: { id: string; fullName: string; donorId: string; mobile: string }[]
  groups: { id: string; name: string }[]
}

export function DonationsTable({ data, donors, groups }: DonationsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDonor, setSelectedDonor] = useState("ALL")
  const [selectedGroup, setSelectedGroup] = useState("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Modal / Sheet Active Items
  const [viewingItem, setViewingItem] = useState<DonationTransactionItem | null>(null)
  const [editingItem, setEditingItem] = useState<DonationTransactionItem | null>(null)
  const [receiptItem, setReceiptItem] = useState<{ item: DonationTransactionItem; mode: "print" | "pdf" } | null>(null)

  const handleDelete = async (id: string) => {
    const isConfirmed = confirm(
      "আপনি কি নিশ্চিত যে আপনি এই অনুদান লেনদেনটি মুছে ফেলতে চান?\n\nএটি স্থায়ীভাবে মুছে যাবে এবং স্বয়ংক্রিয়ভাবে ডোনার লেজার, গ্রুপ লেজার, গ্রুপ টোটাল ফান্ড এবং ড্যাশবোর্ড হিসাব রিভার্স (Reverse) করা হবে।"
    )
    if (!isConfirmed) return

    const res = await deleteDonationTransaction(id)
    if (res.success) {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে", { description: "লেনদেন এবং সংশ্লিষ্ট সকল লেজার এন্ট্রি স্বয়ংক্রিয়ভাবে রিভার্স করা হয়েছে।" })
    } else {
      toast.error("মুছে ফেলা সম্ভব হয়নি", { description: (res as any).error })
    }
  }

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const voucherNo = row.voucherNo.toLowerCase()
        const donorName = (row.donor?.fullName || "").toLowerCase()
        const donorMobile = (row.donor?.mobile || "").toLowerCase()
        const groupName = (row.groupName || "").toLowerCase()
        const remarks = (row.remarks || "").toLowerCase()
        const creator = (row.createdBy || "").toLowerCase()

        if (!voucherNo.includes(q) && !donorName.includes(q) && !donorMobile.includes(q) && !groupName.includes(q) && !remarks.includes(q) && !creator.includes(q)) {
          return false
        }
      }

      // 2. Donor filter
      if (selectedDonor !== "ALL" && row.donorId !== selectedDonor) {
        return false
      }

      // 3. Group filter
      if (selectedGroup !== "ALL" && row.groupId !== selectedGroup) {
        return false
      }

      // 4. Date Range filter
      if (fromDate) {
        const rowDate = new Date(row.date).setHours(0, 0, 0, 0)
        const filterFrom = new Date(fromDate).setHours(0, 0, 0, 0)
        if (rowDate < filterFrom) return false
      }
      if (toDate) {
        const rowDate = new Date(row.date).setHours(23, 59, 59, 999)
        const filterTo = new Date(toDate).setHours(23, 59, 59, 999)
        if (rowDate > filterTo) return false
      }

      return true
    })
  }, [data, searchQuery, selectedDonor, selectedGroup, fromDate, toDate])

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedDonor("ALL")
    setSelectedGroup("ALL")
    setFromDate("")
    setToDate("")
  }

  const columns: ColumnDef<DonationTransactionItem>[] = [
    {
      accessorKey: "date",
      header: "তারিখ (Date)",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{formatDate(row.getValue("date"))}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(row.getValue("date") as string).toLocaleDateString("bn-BD")}
          </div>
        </div>
      ),
    },
    {
      id: "voucherNo",
      accessorKey: "voucherNo",
      header: "ভাউচার নং (Voucher No)",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-primary/10 border border-primary/20 px-2 py-1 rounded font-bold text-primary">
          {row.getValue("voucherNo")}
        </span>
      ),
    },
    {
      id: "donorName",
      header: "অনুদানদাতা (Donor Name)",
      cell: ({ row }) => {
        const donor = row.original.donor
        return (
          <div>
            <div className="font-semibold text-foreground">{donor?.fullName || "অজানা অনুদানদাতা"}</div>
            {donor && (
              <div className="text-xs text-muted-foreground">
                আইডি: {donor.donorId} | {donor.mobile}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "selectedGroup",
      header: "তহবিল গন্তব্য (Selected Group)",
      cell: ({ row }) => (
        <div className="font-medium text-foreground bg-muted px-2.5 py-1 rounded w-fit text-xs border">
          {row.original.groupName}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "পরিমাণ (Amount)",
      cell: ({ row }) => (
        <span className="font-bold text-green-600 dark:text-green-400 font-mono text-base">
          ৳{row.getValue("amount")}
        </span>
      ),
    },
    {
      accessorKey: "remarks",
      header: "বিবরণ / মন্তব্য (Remarks)",
      cell: ({ row }) => (
        <div className="max-w-[180px] truncate text-muted-foreground text-sm" title={row.getValue("remarks") as string || ""}>
          {row.getValue("remarks") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "এন্ট্রি (Created By)",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
          {row.getValue("createdBy") || "Admin"}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-right">অ্যাকশন</div>,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>অ্যাকশনসমূহ</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setViewingItem(item)} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4 text-blue-500" /> বিস্তারিত দেখুন (View)
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setEditingItem(item)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4 text-amber-500" /> সম্পাদনা করুন (Edit)
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setReceiptItem({ item, mode: "print" })} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4 text-emerald-500" /> প্রিন্ট রিসিট (Print Receipt)
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setReceiptItem({ item, mode: "pdf" })} className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4 text-purple-500" /> এক্সপোর্ট PDF (Export PDF)
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    if (item.donorId) {
                      router.push(`/donors/ledger?donorId=${item.donorId}`)
                      toast.info("ডোনার লেজার ওপেন করা হয়েছে", { description: `অনুদানদাতা: ${item.donor?.fullName || item.donorId}` })
                    } else {
                      toast.error("ডোনার পাওয়া যায়নি")
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4 text-sky-500" /> ডোনার লেজার খুলুন
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    if (item.groupId) {
                      router.push(`/groups/${item.groupId}/ledger`)
                      toast.info("গ্রুপ লেজার ওপেন করা হয়েছে", { description: `গ্রুপ: ${item.groupName}` })
                    } else {
                      router.push("/groups/fund")
                    }
                  }}
                  className="cursor-pointer"
                >
                  <Building className="mr-2 h-4 w-4 text-indigo-500" /> গ্রুপ লেজার খুলুন
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="cursor-pointer text-destructive focus:text-destructive">
                  <Trash className="mr-2 h-4 w-4" /> মুছে ফেলুন (Delete)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  const hasActiveFilters = searchQuery !== "" || selectedDonor !== "ALL" || selectedGroup !== "ALL" || fromDate !== "" || toDate !== ""

  return (
    <div className="space-y-4">
      {/* Filters Card */}
      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            অনুদান ফিল্টার (Filter Donations)
          </h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive">
              <FilterX className="h-3.5 w-3.5 mr-1" /> রিসেট ফিল্টার
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">অনুসন্ধান (Search)</label>
            <Input
              placeholder="ভাউচার, নাম, মোবাইল বা বিবরণ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Donor Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">অনুদানদাতা (Donor)</label>
            <Select value={selectedDonor} onValueChange={setSelectedDonor}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="সকল অনুদানদাতা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">সকল অনুদানদাতা (All Donors)</SelectItem>
                {donors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.fullName} ({d.donorId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">গ্রুপ (Selected Group)</label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="সকল গ্রুপ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">সকল গ্রুপ (All Groups)</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">শুরু তারিখ (From Date)</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">শেষ তারিখ (To Date)</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-medium text-base">কোন অনুদান লেনদেন পাওয়া যায়নি</p>
                    <p className="text-xs text-muted-foreground">
                      {hasActiveFilters ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন" : "'অনুদান গ্রহণ' মেনু থেকে নতুন অনুদান এন্ট্রি করুন।"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground">
              মোট <span className="font-bold text-foreground">{filteredData.length}</span> টি লেনদেন প্রদর্শিত
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 px-3 text-xs"
              >
                পূর্ববর্তী (Prev)
              </Button>
              <span className="text-xs font-medium px-2">
                পৃষ্ঠা {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 px-3 text-xs"
              >
                পরবর্তী (Next)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Sheets */}
      <ViewDonationDialog
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        donation={viewingItem}
      />

      <EditDonationSheet
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        donation={editingItem}
        donors={donors}
        groups={groups}
      />

      <ReceiptDonationModal
        isOpen={!!receiptItem}
        onClose={() => setReceiptItem(null)}
        donation={receiptItem?.item || null}
        mode={receiptItem?.mode}
      />
    </div>
  )
}
