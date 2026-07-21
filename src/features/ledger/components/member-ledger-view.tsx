"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MemberCombobox } from "@/components/member-combobox"
import { formatCurrency, formatDate, formatMonth } from "@/lib/format"
import { Printer, Download } from "lucide-react"
import { getMemberLedger } from "../actions"

type MemberLedgerViewProps = {
  members: {
    id: string
    memberId: string
    fullName: string | null
    group: { name: string; code: string } | null
  }[]
}

export function MemberLedgerView({ members }: MemberLedgerViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentMemberId = searchParams.get("memberId") || ""
  
  const [ledgerData, setLedgerData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  // Filters
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [month, setMonth] = useState("ALL")
  const [year, setYear] = useState("ALL")

  useEffect(() => {
    if (currentMemberId) {
      setLoading(true)
      getMemberLedger(currentMemberId)
        .then(data => {
          setLedgerData(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    } else {
      setLedgerData(null)
    }
  }, [currentMemberId])

  const handleMemberChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("memberId", value)
    } else {
      params.delete("memberId")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePrint = () => {
    window.print()
  }

  let filteredLedger = ledgerData?.ledger || []
  
  if (fromDate) {
    filteredLedger = filteredLedger.filter((r: any) => new Date(r.date) >= new Date(fromDate))
  }
  if (toDate) {
    filteredLedger = filteredLedger.filter((r: any) => new Date(r.date) <= new Date(toDate))
  }
  if (month !== "ALL") {
    filteredLedger = filteredLedger.filter((r: any) => new Date(r.date).getMonth() + 1 === parseInt(month))
  }
  if (year !== "ALL") {
    filteredLedger = filteredLedger.filter((r: any) => new Date(r.date).getFullYear() === parseInt(year))
  }

  // Recalculate summary based on filters? 
  // Actually, standard accounting usually shows the overall summary, or summary of the filtered period.
  // The user says "মোট জমা, মোট উত্তোলন, বর্তমান ব্যালেন্স".
  const totalDeposit = filteredLedger.reduce((sum: number, r: any) => sum + r.deposit, 0)
  const totalWithdrawal = filteredLedger.reduce((sum: number, r: any) => sum + r.withdrawal, 0)
  // Current balance should be the final balance of the filtered rows, or the member's absolute final balance?
  // Usually it's the absolute final balance.
  const currentBalance = ledgerData?.ledger.length > 0 ? ledgerData.ledger[ledgerData.ledger.length - 1].balance : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4 bg-muted/30 p-4 rounded-lg border hide-print">
        <div className="flex-1 max-w-sm">
          <Label className="mb-2 block">সদস্য নির্বাচন করুন</Label>
          <MemberCombobox 
            members={members}
            value={currentMemberId}
            onChange={handleMemberChange}
            placeholder="সদস্য খুঁজুন..."
          />
        </div>
      </div>

      {loading && <div className="text-center py-10">লোড হচ্ছে...</div>}

      {!loading && !currentMemberId && (
        <Card className="hide-print">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p>অনুগ্রহ করে একজন সদস্য নির্বাচন করুন</p>
          </CardContent>
        </Card>
      )}

      {!loading && ledgerData && (
        <div className="space-y-6 animate-in fade-in duration-300 print:space-y-4">
          
          <div className="flex justify-between items-center hide-print">
            <h2 className="text-xl font-bold">সদস্য খতিয়ান (Ledger)</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> প্রিন্ট
              </Button>
            </div>
          </div>

          {/* Member Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">সদস্যের নাম</p>
                  <p className="font-semibold text-lg">{ledgerData.member.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">সদস্য আইডি</p>
                  <p className="font-mono font-medium">{ledgerData.member.memberId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">গ্রুপ</p>
                  <p className="font-medium">{ledgerData.member.groupName} ({ledgerData.member.groupCode})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">যোগদানের তারিখ</p>
                  <p className="font-medium">{formatDate(ledgerData.member.joinDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">বর্তমান অবস্থা</p>
                  <p className="font-medium">{ledgerData.member.status === "ACTIVE" ? "সক্রিয়" : "নিষ্ক্রিয়"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="hide-print">
            <CardContent className="p-4 flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label>শুরুর তারিখ</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>শেষ তারিখ</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>মাস</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">সব মাস</SelectItem>
                    {Array.from({length: 12}, (_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString()}>{formatMonth(i)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>বছর</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">সব বছর</SelectItem>
                    {Array.from({length: 5}, (_, i) => (
                      <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                        {new Date().getFullYear() - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" onClick={() => { setFromDate(""); setToDate(""); setMonth("ALL"); setYear("ALL"); }}>
                রিসেট
              </Button>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 dark:bg-emerald-950/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">মোট জমা</p>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">৳{formatCurrency(totalDeposit)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-rose-50 dark:bg-rose-950/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-rose-800 dark:text-rose-400">মোট উত্তোলন</p>
                <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-100">৳{formatCurrency(totalWithdrawal)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">বর্তমান ব্যালেন্স</p>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">৳{formatCurrency(currentBalance)}</h3>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">তারিখ</th>
                    <th className="px-4 py-3 font-medium">ভাউচার / রেফারেন্স</th>
                    <th className="px-4 py-3 font-medium">বিবরণ</th>
                    <th className="px-4 py-3 font-medium text-right">জমা</th>
                    <th className="px-4 py-3 font-medium text-right">উত্তোলন</th>
                    <th className="px-4 py-3 font-medium text-right">ব্যালেন্স</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map((row: any) => (
                      <tr key={row.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.date)}</td>
                        <td className="px-4 py-3 font-mono">{row.reference}</td>
                        <td className="px-4 py-3">{row.description}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                          {row.deposit > 0 ? `৳${formatCurrency(row.deposit)}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                          {row.withdrawal > 0 ? `৳${formatCurrency(row.withdrawal)}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          ৳{formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        কোন লেনদেন পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .hide-print {
            display: none !important;
          }
          body {
            background-color: white;
            color: black;
          }
          .print\\:space-y-4 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-y-reverse: 0;
            margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(1rem * var(--tw-space-y-reverse));
          }
          /* Override theme colors for print */
          .text-emerald-900, .text-emerald-800, .text-emerald-600, .text-emerald-400 { color: #059669 !important; }
          .text-rose-900, .text-rose-800, .text-rose-600, .text-rose-400 { color: #e11d48 !important; }
          .text-blue-900, .text-blue-800, .text-blue-600, .text-blue-400 { color: #2563eb !important; }
          .bg-emerald-50, .dark\\:bg-emerald-950\\/20 { background-color: #ecfdf5 !important; border: 1px solid #d1fae5; }
          .bg-rose-50, .dark\\:bg-rose-950\\/20 { background-color: #fff1f2 !important; border: 1px solid #ffe4e6; }
          .bg-blue-50, .dark\\:bg-blue-950\\/20 { background-color: #eff6ff !important; border: 1px solid #dbeafe; }
        }
      `}</style>
    </div>
  )
}
