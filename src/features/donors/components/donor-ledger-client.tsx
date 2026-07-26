"use client"
import { getNow } from "@/lib/date";

import { useState, useMemo } from "react"
import { formatCurrency, formatDate } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Download, Search, FilterX, Users, FileText, Banknote } from "lucide-react"
import type { DonationTransactionItem } from "../actions"

interface DonorLedgerClientProps {
  data: DonationTransactionItem[]
  donors: { id: string; fullName: string; donorId: string; mobile: string }[]
  groups: { id: string; name: string }[]
}

export function DonorLedgerClient({ data, donors, groups }: DonorLedgerClientProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDonor, setSelectedDonor] = useState("ALL")
  const [selectedGroup, setSelectedGroup] = useState("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const voucherNo = row.voucherNo.toLowerCase()
        const donorName = (row.donor?.fullName || "").toLowerCase()
        const groupName = (row.groupName || "").toLowerCase()
        const remarks = (row.remarks || "").toLowerCase()

        if (!voucherNo.includes(q) && !donorName.includes(q) && !groupName.includes(q) && !remarks.includes(q)) {
          return false
        }
      }
      // 2. Donor filter
      if (selectedDonor !== "ALL" && row.donorId !== selectedDonor) return false
      // 3. Group filter
      if (selectedGroup !== "ALL" && row.groupId !== selectedGroup) return false
      // 4. Date Range
      if (fromDate) {
        if (new Date(row.date).setHours(0,0,0,0) < new Date(fromDate).setHours(0,0,0,0)) return false
      }
      if (toDate) {
        if (new Date(row.date).setHours(23,59,59,999) > new Date(toDate).setHours(23,59,59,999)) return false
      }
      return true
    })
  }, [data, searchQuery, selectedDonor, selectedGroup, fromDate, toDate])

  // Compute Running Balance (calculated from oldest to newest)
  // Data is already sorted newest first (desc) from the action, so we reverse it for balance calculation
  const dataWithBalance = useMemo(() => {
    // Clone and reverse to oldest first
    const oldestFirst = [...filteredData].reverse()
    let balance = 0
    const calculated = oldestFirst.map(row => {
      balance += row.amount
      return { ...row, runningBalance: balance }
    })
    // Reverse back to newest first
    return calculated.reverse()
  }, [filteredData])

  // Summary Metrics
  const summary = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, row) => sum + row.amount, 0)
    const uniqueDonors = new Set(filteredData.map(r => r.donorId)).size
    return { totalTransactions: filteredData.length, totalAmount, uniqueDonors }
  }, [filteredData])

  const activeDonor = useMemo(() => donors.find(d => d.id === selectedDonor), [selectedDonor, donors])

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedDonor("ALL")
    setSelectedGroup("ALL")
    setFromDate("")
    setToDate("")
  }

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const headers = ["তারিখ (Date)", "ভাউচার নং (Voucher No)", "অনুদানদাতা (Donor Name)", "মোবাইল (Mobile)", "তহবিল গন্তব্য (Selected Group)", "বিবরণ / মন্তব্য (Remarks)", "পরিমাণ (Amount)", "চলমান ব্যালেন্স (Running Balance)"]
    const rows = dataWithBalance.map(r => [
      formatDate(r.date),
      r.voucherNo,
      r.donor?.fullName || "",
      r.donor?.mobile || "",
      r.groupName,
      (r.remarks || "").replace(/,/g, " "), // avoid csv comma issue
      r.amount,
      r.runningBalance
    ].join(","))
    
    const csvContent = '\uFEFF' + headers.join(",") + "\n" + rows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Donor_Ledger_${getNow().toLocaleDateString('en-CA')}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-lg border hide-print">
        <div>
          <Label className="mb-2 block">অনুসন্ধান (Search)</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ভাউচার, নাম বা বিবরণ..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label className="mb-2 block">অনুদানদাতা (Donor)</Label>
          <Select value={selectedDonor} onValueChange={setSelectedDonor}>
            <SelectTrigger>
              <SelectValue placeholder="সকল অনুদানদাতা" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">সকল অনুদানদাতা (All Donors)</SelectItem>
              {donors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.fullName} ({d.mobile})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block">গ্রুপ (Group)</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="সকল গ্রুপ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">সকল গ্রুপ (All Groups)</SelectItem>
              {groups.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block">শুরু তারিখ (From)</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="mb-2 block">শেষ তারিখ (To)</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={handleResetFilters} title="রিসেট ফিল্টার" className="mb-[1px]">
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedDonor !== "ALL" && activeDonor ? (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">নির্বাচিত অনুদানদাতা</p>
                <h3 className="text-2xl font-bold mt-1">{activeDonor.fullName}</h3>
                <p className="text-xs text-muted-foreground">{activeDonor.donorId} | {activeDonor.mobile}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">মোট অনুদানদাতা (Total Donors)</p>
                <h3 className="text-2xl font-bold mt-1">{summary.uniqueDonors} জন</h3>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">মোট লেনদেন (Total Transactions)</p>
              <h3 className="text-2xl font-bold mt-1">{summary.totalTransactions} টি</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className={selectedDonor !== "ALL" ? "bg-emerald-500/10 border-emerald-500/20" : ""}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">মোট অনুদান পরিমাণ (Total Amount)</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">৳{formatCurrency(summary.totalAmount)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="print:shadow-none print:border-none print:m-0">
        <div className="flex justify-between items-center p-4 border-b hide-print">
          <h2 className="text-lg font-semibold">লেজার এন্ট্রি (Ledger Entries)</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> Excel/CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> প্রিন্ট / PDF
            </Button>
          </div>
        </div>

        {/* Print Header (Hidden on screen) */}
        <div className="hidden print:block text-center pb-6 mb-6 border-b">
          <h1 className="text-2xl font-bold">Foundation ERP</h1>
          <h2 className="text-xl font-semibold mt-1">অনুদানদাতার লেজার (Master Ledger)</h2>
          {selectedDonor !== "ALL" && activeDonor && (
            <div className="mt-2 text-sm">
              <p>অনুদানদাতা: <strong>{activeDonor.fullName}</strong> ({activeDonor.donorId})</p>
              <p>মোবাইল: {activeDonor.mobile}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            প্রিন্ট তারিখ: {formatDate(getNow())}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">তারিখ</th>
                <th className="px-4 py-3 font-medium">ভাউচার নং</th>
                <th className="px-4 py-3 font-medium">অনুদানদাতা (Mobile)</th>
                <th className="px-4 py-3 font-medium">গ্রুপ (Group)</th>
                <th className="px-4 py-3 font-medium">বিবরণ / মন্তব্য</th>
                <th className="px-4 py-3 font-medium text-right">পরিমাণ (Amount)</th>
                <th className="px-4 py-3 font-medium text-right">চলমান ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dataWithBalance.length > 0 ? (
                dataWithBalance.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{formatDate(row.date)}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.voucherNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.donor?.fullName}</div>
                      <div className="text-xs text-muted-foreground">{row.donor?.mobile}</div>
                    </td>
                    <td className="px-4 py-3">{row.groupName}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={row.remarks}>
                      {row.remarks || "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      ৳{formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      ৳{formatCurrency(row.runningBalance)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    কোন লেনদেন পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
            {/* Footer row for Totals */}
            {dataWithBalance.length > 0 && (
              <tfoot className="bg-muted/50 font-bold border-t-2">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right">সর্বমোট (Total Amount):</td>
                  <td className="px-4 py-3 text-right text-emerald-600">৳{formatCurrency(summary.totalAmount)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
      
      <style jsx global>{`
        @media print {
          .hide-print { display: none !important; }
          body { background-color: white; color: black; }
          @page { margin: 1cm; size: landscape; }
        }
      `}</style>
    </div>
  )
}
