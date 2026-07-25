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
import { Badge } from "@/components/ui/badge"
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
import { MoreHorizontal, FileText, Download, Printer, Eye, Edit, Trash, Search, FilterX, Building } from "lucide-react"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import { deleteCampaignContribution } from "../actions"
import { ViewCampaignContributionDialog, type ContributionItem } from "./view-campaign-contribution-dialog"
import { EditCampaignContributionSheet } from "./edit-campaign-contribution-sheet"
import { ReceiptCampaignContributionModal } from "./receipt-campaign-contribution-modal"

interface CampaignOption {
  id: string
  name: string
}

export function CampaignContributionsTable({ data, campaigns = [] }: { data: ContributionItem[], campaigns?: CampaignOption[] }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFund, setSelectedFund] = useState("ALL")
  const [contributorTypeFilter, setContributorTypeFilter] = useState("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Modal / Sheet Active Items
  const [viewingItem, setViewingItem] = useState<ContributionItem | null>(null)
  const [editingItem, setEditingItem] = useState<ContributionItem | null>(null)
  const [receiptItem, setReceiptItem] = useState<{ item: ContributionItem; mode: "print" | "pdf" } | null>(null)

  const handleDelete = async (id: string) => {
    const isConfirmed = confirm(
      "আপনি কি নিশ্চিত যে আপনি এই তহবিল গ্রহণের রেকর্ডটি মুছে ফেলতে চান?\n\nএটি স্থায়ীভাবে মুছে যাবে এবং স্বয়ংক্রিয়ভাবে তহবিল লেজার, ডোনার লেজার, এবং ড্যাশবোর্ড হিসাব সমন্বয় (Reverse) করা হবে।"
    )
    if (!isConfirmed) return

    const res = await deleteCampaignContribution(id)
    if (res.success) {
      toast.success("সফলভাবে মুছে ফেলা হয়েছে", { description: "লেনদেন এবং সংশ্লিষ্ট লেজার এন্ট্রি রিভার্স করা হয়েছে।" })
    } else {
      toast.error("ব্যর্থ হয়েছে", { description: res.error })
    }
  }

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const voucherNo = `vch-${row.ledgerTransactionId.slice(0, 8).toLowerCase()}`
        const contributorName = (row.member?.fullName || row.donor?.fullName || "").toLowerCase()
        const fundName = (row.campaign?.name || "").toLowerCase()
        const remarks = (row.remarks || "").toLowerCase()

        if (!voucherNo.includes(q) && !contributorName.includes(q) && !fundName.includes(q) && !remarks.includes(q)) {
          return false
        }
      }

      // 2. Fund filter
      if (selectedFund !== "ALL" && row.campaignId !== selectedFund) {
        return false
      }

      // 3. Member / Non-Member filter
      if (contributorTypeFilter === "MEMBER" && !row.memberId) return false
      if (contributorTypeFilter === "DONOR" && !row.donorId) return false

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
  }, [data, searchQuery, selectedFund, contributorTypeFilter, fromDate, toDate])

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedFund("ALL")
    setContributorTypeFilter("ALL")
    setFromDate("")
    setToDate("")
  }

  const columns: ColumnDef<ContributionItem>[] = [
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
      header: "ভাউচার নং (Voucher No)",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded font-bold text-primary">
          VCH-{row.original.ledgerTransactionId.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      id: "fundName",
      header: "তহবিলের নাম (Fund Name)",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.campaign?.name || "N/A"}
        </div>
      ),
    },
    {
      id: "contributorName",
      header: "প্রদানকারী (Contributor)",
      cell: ({ row }) => {
        const member = row.original.member
        const donor = row.original.donor
        return (
          <div>
            <div className="font-medium">{member?.fullName || donor?.fullName || "অজানা"}</div>
            <div className="text-xs text-muted-foreground">
              {member ? `সদস্য আইডি: ${member.memberId}` : donor ? `মোবাইল: ${donor.mobile}` : "N/A"}
            </div>
          </div>
        )
      },
    },
    {
      id: "contributorType",
      header: "ধরন (Type)",
      cell: ({ row }) => (
        <Badge variant={row.original.memberId ? "default" : "secondary"}>
          {row.original.memberId ? "সদস্য" : "ডোনার / অ-সদস্য"}
        </Badge>
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
      header: "বিবরণ (Remarks)",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-muted-foreground text-sm" title={row.getValue("remarks") as string || ""}>
          {row.getValue("remarks") || "তহবিলে জমা"}
        </div>
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
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setViewingItem(item)} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> বিস্তারিত দেখুন
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setEditingItem(item)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setReceiptItem({ item, mode: "print" })} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" /> প্রিন্ট রিসিট (Receipt)
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setReceiptItem({ item, mode: "pdf" })} className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" /> এক্সপোর্ট PDF
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => {
                    router.push(`/campaigns/ledger?campaignId=${item.campaignId}`)
                    toast.info("তহবিল লেজার ওপেন করা হয়েছে", { description: `লেনদেন ভাউচার: VCH-${item.ledgerTransactionId.slice(0, 8).toUpperCase()}` })
                  }} 
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" /> তহবিল লেজার দেখুন
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

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="p-4 bg-card rounded-lg border space-y-4">
        <div className="text-sm font-semibold flex items-center justify-between border-b pb-2">
          <span>ফিল্টার ও অনুসন্ধান (Filters & Search)</span>
          {(searchQuery || selectedFund !== "ALL" || contributorTypeFilter !== "ALL" || fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs h-7 text-muted-foreground hover:text-foreground">
              <FilterX className="w-3.5 h-3.5 mr-1" /> সকল ফিল্টার মুছুন
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">অনুসন্ধান (Search)</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="নাম, ভাউচার নং বা বিবরণ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Fund Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">তহবিল (Fund Filter)</label>
            <Select value={selectedFund} onValueChange={setSelectedFund}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="সকল তহবিল" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">সকল তহবিল (All Funds)</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Member / Non-Member Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">প্রদানকারী ধরন (Member / Non-Member)</label>
            <Select value={contributorTypeFilter} onValueChange={setContributorTypeFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="সকল প্রদানকারী" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">সকল প্রদানকারী (All)</SelectItem>
                <SelectItem value="MEMBER">সদস্য (Member)</SelectItem>
                <SelectItem value="DONOR">ডোনার / অ-সদস্য (Non-Member)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">তারিখের সীমা (Date Range)</label>
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 text-xs px-2"
                title="From Date"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 text-xs px-2"
                title="To Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-xs text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Building className="h-8 w-8 text-muted-foreground opacity-40" />
                    <span className="font-medium text-base">কোনো তহবিল লেনদেন পাওয়া যায়নি</span>
                    <p className="text-xs text-muted-foreground">আপনার নির্বাচিত ফিল্টারে কোনো তথ্য নেই।</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          মোট <span className="font-bold text-foreground">{filteredData.length}</span> টি লেনদেন প্রদর্শন করা হচ্ছে।
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 px-3"
          >
            পূর্ববর্তী
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 px-3"
          >
            পরবর্তী
          </Button>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <ViewCampaignContributionDialog
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        contribution={viewingItem}
      />

      <EditCampaignContributionSheet
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        contribution={editingItem}
      />

      {receiptItem && (
        <ReceiptCampaignContributionModal
          isOpen={!!receiptItem}
          onClose={() => setReceiptItem(null)}
          contribution={receiptItem.item}
          mode={receiptItem.mode}
        />
      )}
    </div>
  )
}
