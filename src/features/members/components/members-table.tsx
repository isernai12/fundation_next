"use client"

import { formatDate } from "@/lib/format"
import { useState, useEffect } from "react"
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
import type { Member, Group } from "@prisma/client"
import { toggleMemberStatus, deleteMember, restoreMember } from "../actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Power,
  PowerOff,
  BookOpen,
  AlertTriangle,
  RotateCcw
} from "lucide-react"
import { useRbac } from "@/components/providers/rbac-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type MemberWithGroup = Member & {
  group: { name: string; code: string } | null
}

export function MembersTable({ data, groups, isManage = false }: { data: MemberWithGroup[], groups: Group[], isManage?: boolean }) {
  const [tableData, setTableData] = useState<MemberWithGroup[]>(data)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Keep tableData updated when prop changes
  useEffect(() => {
    setTableData(data)
  }, [data])

  // Confirmation modal states
  const [statusConfirmMember, setStatusConfirmMember] = useState<MemberWithGroup | null>(null)
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<MemberWithGroup | null>(null)
  const [restoreConfirmMember, setRestoreConfirmMember] = useState<MemberWithGroup | null>(null)

  // Reason form state
  const [selectedReason, setSelectedReason] = useState<string>("Temporary inactive")
  const [customNote, setCustomNote] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { can, permissions } = useRbac()
  const isSuperAdmin = permissions.includes("*")
  const canView = can("Members", "View")
  const canEdit = can("Members", "Edit")
  const canDelete = can("Members", "Delete")
  const canViewLedger = can("Reports", "View") || canView

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirmMember) return
    const memberId = statusConfirmMember.id
    const currentStatus = statusConfirmMember.status
    const targetStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"

    const reasonText = currentStatus === "ACTIVE"
      ? (selectedReason === "Other" ? (customNote || "Other") : selectedReason)
      : (customNote || "Member Reactivated");

    setIsSubmitting(true)

    // Optimistic Update: Update badge instantly
    setTableData(prev =>
      prev.map(m => (m.id === memberId ? { ...m, status: targetStatus } : m))
    )

    const res = await toggleMemberStatus(memberId, targetStatus, reasonText, customNote)
    setIsSubmitting(false)
    setStatusConfirmMember(null)
    setCustomNote("")

    if (res.success) {
      toast.success(
        targetStatus === "ACTIVE"
          ? "সদস্যকে সফলভাবে পুনরায় সক্রিয় করা হয়েছে"
          : "সদস্যকে সফলভাবে নিষ্ক্রিয় করা হয়েছে"
      )
    } else {
      // Revert state if failed
      setTableData(prev =>
        prev.map(m => (m.id === memberId ? { ...m, status: currentStatus } : m))
      )
      toast.error(res.error || "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmMember) return
    const memberId = deleteConfirmMember.id
    const backupMember = deleteConfirmMember

    setIsSubmitting(true)

    // Optimistic Update: Mark as DELETED or remove if filtered
    setTableData(prev => prev.filter(m => m.id !== memberId))

    const res = await deleteMember(memberId)
    setIsSubmitting(false)
    setDeleteConfirmMember(null)

    if (res.success) {
      toast.success("সদস্য সফলভাবে সফট-ডিলিট করা হয়েছে")
    } else {
      // Revert if error
      setTableData(prev => [backupMember, ...prev])
      toast.error(res.error || "সদস্য মুছে ফেলা সম্ভব নয়")
    }
  }

  const handleConfirmRestore = async () => {
    if (!restoreConfirmMember) return
    const memberId = restoreConfirmMember.id

    setIsSubmitting(true)

    setTableData(prev =>
      prev.map(m => (m.id === memberId ? { ...m, status: "ACTIVE" } : m))
    )

    const res = await restoreMember(memberId, customNote || "Restored by Super Admin")
    setIsSubmitting(false)
    setRestoreConfirmMember(null)
    setCustomNote("")

    if (res.success) {
      toast.success("সদস্যকে পুনরায় সক্রিয়/পুনঃস্থাপন করা হয়েছে")
    } else {
      toast.error(res.error || "পুনঃস্থাপন ব্যর্থ হয়েছে")
    }
  }

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
        if (status === "ACTIVE") {
          return (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              🟢 Active
            </Badge>
          )
        }
        if (status === "INACTIVE") {
          return (
            <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 gap-1 font-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              🔴 Inactive
            </Badge>
          )
        }
        return <Badge variant="destructive">{status}</Badge>
      },
    },
    {
      accessorKey: "joinDate",
      header: "যোগদানের তারিখ",
      cell: ({ row }) => row.original.joinDate ? formatDate(row.original.joinDate) : 'N/A',
    },
    {
      id: "actions",
      header: () => <div className="text-right">অ্যাকশন</div>,
      cell: ({ row }) => {
        const member = row.original

        const showView = canView
        const showEdit = canEdit && member.status !== "DELETED"
        const showLedger = canViewLedger
        const showStatusToggle = canEdit && member.status !== "DELETED"
        const showDelete = canDelete && member.status !== "DELETED"
        const showRestore = isSuperAdmin && member.status === "DELETED"

        const hasAnyAction = showView || showEdit || showLedger || showStatusToggle || showDelete || showRestore

        if (!hasAnyAction) return null

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  সদস্য অপশন
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* 1. View Details */}
                {showView && (
                  <DropdownMenuItem asChild>
                    <Link href={`/members/${member.id}`} className="cursor-pointer flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-blue-500" />
                      <span>বিস্তারিত দেখুন</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* 2. Edit Member */}
                {showEdit && (
                  <DropdownMenuItem asChild>
                    <Link href={`/members/${member.id}/edit`} className="cursor-pointer flex items-center">
                      <Edit className="mr-2 h-4 w-4 text-amber-500" />
                      <span>সদস্য সম্পাদনা</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* 3. Member Ledger */}
                {showLedger && (
                  <DropdownMenuItem asChild>
                    <Link href={`/members/ledger?memberId=${member.id}`} className="cursor-pointer flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>সদস্য লেজার</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* 4. Active / Deactivate */}
                {showStatusToggle && (
                  <>
                    <DropdownMenuSeparator />
                    {member.status === "ACTIVE" ? (
                      <DropdownMenuItem
                        className="cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-600"
                        onClick={() => {
                          setSelectedReason("Temporary inactive")
                          setStatusConfirmMember(member)
                        }}
                      >
                        <PowerOff className="mr-2 h-4 w-4 text-amber-500" />
                        <span>নিষ্ক্রিয় করুন</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer text-emerald-600 dark:text-emerald-400 focus:text-emerald-600"
                        onClick={() => {
                          setSelectedReason("")
                          setStatusConfirmMember(member)
                        }}
                      >
                        <Power className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>সক্রিয় করুন</span>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {/* Restore for Super Admin */}
                {showRestore && (
                  <DropdownMenuItem
                    className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                    onClick={() => setRestoreConfirmMember(member)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>পুনঃস্থাপন করুন</span>
                  </DropdownMenuItem>
                )}

                {/* 5. Delete Member */}
                {showDelete && (
                  <>
                    {!showStatusToggle && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => setDeleteConfirmMember(member)}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      <span>সদস্য মুছে ফেলুন</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: tableData,
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
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 py-2">
        <Input
          placeholder="নাম দিয়ে খুঁজুন..."
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        {/* Status Filter */}
        <Select 
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") table.getColumn("status")?.setFilterValue("")
            else table.getColumn("status")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সকল স্ট্যাটাস</SelectItem>
            <SelectItem value="ACTIVE">🟢 সক্রিয় (Active)</SelectItem>
            <SelectItem value="INACTIVE">🔴 নিষ্ক্রিয় (Inactive)</SelectItem>
            {isSuperAdmin && <SelectItem value="DELETED">⚫ মুছে ফেলা (Deleted)</SelectItem>}
          </SelectContent>
        </Select>

        {/* Group Filter */}
        <Select 
          value={(table.getColumn("groupId")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(value) => {
            if (value === "ALL") table.getColumn("groupId")?.setFilterValue("")
            else table.getColumn("groupId")?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="গ্রুপ দিয়ে ফিল্টার করুন" />
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

      <div className="flex items-center justify-end space-x-2 py-2">
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

      {/* Confirmation Dialog: Status Toggle (Deactivate / Activate) */}
      <Dialog open={!!statusConfirmMember} onOpenChange={(open) => !open && setStatusConfirmMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {statusConfirmMember?.status === "ACTIVE" ? (
                <>
                  <PowerOff className="h-5 w-5 text-amber-500" />
                  <span>সদস্য নিষ্ক্রিয়করণের নিশ্চয়তা</span>
                </>
              ) : (
                <>
                  <Power className="h-5 w-5 text-emerald-500" />
                  <span>সদস্য সক্রিয়করণের নিশ্চয়তা</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="py-2 text-sm text-muted-foreground leading-relaxed">
              {statusConfirmMember?.status === "ACTIVE" ? (
                <>
                  আপনি কি নিশ্চিত যে <strong>{statusConfirmMember?.fullName}</strong> ({statusConfirmMember?.memberId})-কে <strong>নিষ্ক্রিয় (Inactive)</strong> করতে চান?
                  <br className="my-1" />
                  নিষ্ক্রিয় করার পর আগামী মাস থেকে নতুন চাঁদা তৈরি হবে না এবং নতুন ঋণ/সহায়তা প্রদান বন্ধ থাকবে। তবে আগের সকল হিস্ট্রি সংরক্ষিত থাকবে।
                </>
              ) : (
                <>
                  আপনি কি নিশ্চিত যে <strong>{statusConfirmMember?.fullName}</strong> ({statusConfirmMember?.memberId})-কে পুনরায় <strong>সক্রিয় (Active)</strong> করতে চান?
                  <br className="my-1" />
                  সক্রিয়করণের পর বর্তমান মাস থেকে পুনরায় নিয়মিত চাঁদা শুরু হবে।
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {statusConfirmMember?.status === "ACTIVE" ? (
              <div className="space-y-1.5">
                <Label htmlFor="deactivate-reason">নিষ্ক্রিয় করার কারণ (Reason)</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger id="deactivate-reason">
                    <SelectValue placeholder="কারণ নির্বাচন করুন..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Left the foundation">প্রতিষ্ঠানের সদস্যপদ ত্যাগ করেছেন</SelectItem>
                    <SelectItem value="Transferred">অন্যত্র স্থানান্তরিত হয়েছেন</SelectItem>
                    <SelectItem value="Deceased">মৃত্যুবরণ করেছেন</SelectItem>
                    <SelectItem value="Temporary inactive">সাময়িক নিষ্ক্রিয় রাখা হয়েছে</SelectItem>
                    <SelectItem value="Other">অন্যান্য কারণ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {(selectedReason === "Other" || statusConfirmMember?.status !== "ACTIVE") && (
              <div className="space-y-1.5">
                <Label htmlFor="custom-reason">নোট / মন্তব্য (Optional)</Label>
                <Input
                  id="custom-reason"
                  placeholder="নোট বা কারণ লিখুন..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" onClick={() => setStatusConfirmMember(null)} disabled={isSubmitting}>
              বাতিল করুন
            </Button>
            <Button
              variant={statusConfirmMember?.status === "ACTIVE" ? "destructive" : "default"}
              onClick={handleConfirmStatusToggle}
              disabled={isSubmitting}
            >
              {isSubmitting ? "প্রসেসিং..." : statusConfirmMember?.status === "ACTIVE" ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Soft Delete */}
      <Dialog open={!!deleteConfirmMember} onOpenChange={(open) => !open && setDeleteConfirmMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>সদস্য সফট-ডিলিটের নিশ্চয়তা</span>
            </DialogTitle>
            <DialogDescription className="space-y-3 py-2 text-sm text-muted-foreground leading-relaxed">
              <p>
                আপনি কি নিশ্চিত যে সদস্য <strong>{deleteConfirmMember?.fullName}</strong> ({deleteConfirmMember?.memberId})-কে মুছে ফেলতে চান?
              </p>
              <div className="rounded-md bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300 text-xs border border-amber-500/20">
                ⚠️ <strong>সতর্কতা:</strong> সফট-ডিলিট করা হলেও সদস্যের সকল আর্থিক ইতিহাস ও রেকর্ড ডাটাবেজে সুরক্ষিত থাকবে। সদস্যের সাথে লেনদেন যুক্ত থাকলে মোছা প্রতিরোধ করা হবে।
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmMember(null)} disabled={isSubmitting}>
              বাতিল করুন
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "প্রসেসিং..." : "হ্যাঁ, সফট-ডিলিট করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Restore */}
      <Dialog open={!!restoreConfirmMember} onOpenChange={(open) => !open && setRestoreConfirmMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
              <span>সদস্য পুনঃস্থাপনের নিশ্চয়তা</span>
            </DialogTitle>
            <DialogDescription className="py-2 text-sm text-muted-foreground leading-relaxed">
              আপনি কি সদস্য <strong>{restoreConfirmMember?.fullName}</strong>-কে পুনরায় মূল তালিকায় সক্রিয় করতে চান?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-2">
            <Button variant="outline" onClick={() => setRestoreConfirmMember(null)} disabled={isSubmitting}>
              বাতিল করুন
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmRestore}
              disabled={isSubmitting}
            >
              {isSubmitting ? "প্রসেসিং..." : "পুনঃস্থাপন করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
