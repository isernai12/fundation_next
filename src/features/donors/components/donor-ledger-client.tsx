"use client"
import { getNow } from "@/lib/date";

import { useState, useMemo, useEffect } from "react"
import { formatCurrency, formatDate } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Download, Search, FilterX, Users, FileText, Banknote, UserCheck } from "lucide-react"
import type { DonationTransactionItem } from "../actions"
import { useBranding } from "@/components/providers/branding-provider"
import { useLanguage } from "@/i18n/LanguageProvider"
import type { ComboboxMember } from "@/components/member-combobox"

interface DonorLedgerClientProps {
  data: DonationTransactionItem[]
  donors: { id: string; fullName: string; donorId: string; mobile: string }[]
  members?: ComboboxMember[]
  groups: { id: string; name: string }[]
}

export function DonorLedgerClient({ data, donors, members = [], groups }: DonorLedgerClientProps) {
  const { t } = useLanguage();
  const branding = useBranding()
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSource, setSelectedSource] = useState("ALL")
  const [selectedDonor, setSelectedDonor] = useState("ALL")
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [printDate, setPrintDate] = useState<string>("")

  useEffect(() => {
    setPrintDate(formatDate(getNow()))
  }, [])

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const voucherNo = row.voucherNo.toLowerCase()
        const donorName = (row.donor?.fullName || "").toLowerCase()
        const donorId = (row.donor?.donorId || "").toLowerCase()
        const memberName = (row.member?.fullName || "").toLowerCase()
        const memberId = (row.member?.memberId || "").toLowerCase()
        const groupName = (row.groupName || "").toLowerCase()
        const remarks = (row.remarks || "").toLowerCase()

        if (!voucherNo.includes(q) && 
            !donorName.includes(q) && 
            !donorId.includes(q) &&
            !memberName.includes(q) &&
            !memberId.includes(q) &&
            !groupName.includes(q) && 
            !remarks.includes(q)) {
          return false
        }
      }
      // 2. Source filter
      if (selectedSource !== "ALL" && row.sourceType !== selectedSource) return false

      // 3. Donor/Member filter
      if (selectedDonor !== "ALL" && row.donorId !== selectedDonor && row.memberId !== selectedDonor) return false

      // 4. Group filter
      if (selectedGroup !== "ALL" && row.groupId !== selectedGroup) return false

      // 5. Date Range
      if (fromDate) {
        if (new Date(row.date).setHours(0,0,0,0) < new Date(fromDate).setHours(0,0,0,0)) return false
      }
      if (toDate) {
        if (new Date(row.date).setHours(23,59,59,999) > new Date(toDate).setHours(23,59,59,999)) return false
      }
      return true
    })
  }, [data, searchQuery, selectedSource, selectedDonor, selectedGroup, fromDate, toDate])

  // Compute Running Balance (calculated from oldest to newest)
  const dataWithBalance = useMemo(() => {
    const oldestFirst = [...filteredData].reverse()
    let balance = 0
    const calculated = []
    for (const row of oldestFirst) {
      balance += row.amount
      calculated.push({ ...row, runningBalance: balance })
    }
    return calculated.reverse()
  }, [filteredData])

  // Summary Metrics
  const summary = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, row) => sum + row.amount, 0)
    const uniqueDonors = new Set(filteredData.map(r => r.donorId || r.memberId)).size
    return { totalTransactions: filteredData.length, totalAmount, uniqueDonors }
  }, [filteredData])

  const activeDonor = useMemo(() => donors.find(d => d.id === selectedDonor), [selectedDonor, donors])

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedSource("ALL")
    setSelectedDonor("ALL")
    setSelectedGroup("ALL")
    setFromDate("")
    setToDate("")
  }

  const handlePrint = () => {
    return (window.print());
  }

  const handleExportCSV = () => {
    const headers = ["Date", "Voucher No", "Source", "Donated By / Name", "ID / Mobile", "Group", "Remarks", "Amount", "Running Balance"]
    const rows = dataWithBalance.map(r => {
      const isMember = r.sourceType === "MEMBER"
      const name = isMember ? (r.member?.fullName || "Member") : (r.donor?.fullName || "Donor")
      const idOrMobile = isMember ? (r.member?.memberId || r.memberId || "") : (r.donor?.mobile || r.donor?.donorId || "")
      const source = isMember ? "Foundation Member" : "External Donor"
      return [
        formatDate(r.date),
        r.voucherNo,
        source,
        name,
        idOrMobile,
        r.groupName,
        (r.remarks || "").replace(/,/g, " "),
        r.amount,
        r.runningBalance
      ].join(",")
    })
    
    const csvContent = '\uFEFF' + headers.join(",") + "\n" + rows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Donation_Ledger_${getNow().toLocaleDateString('en-CA')}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 bg-muted/30 p-4 rounded-lg border hide-print">
        <div>
          <Label className="mb-2 block">{t("donors.search_939bb4")}</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("donors.k_5efc15")} 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">{t("donors.donation_source")}</Label>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger>
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              <SelectItem value="MEMBER">{t("donors.source_member")}</SelectItem>
              <SelectItem value="DONOR">{t("donors.source_donor")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">{t("donors.donor_9c2b8d")}</Label>
          <Select value={selectedDonor} onValueChange={setSelectedDonor}>
            <SelectTrigger>
              <SelectValue placeholder={t("donors.k_22da40")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("donors.all_donors_e94b73")}</SelectItem>
              {donors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.fullName} ({d.mobile})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">{t("donors.group_d4d811")}</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder={t("donors.k_a3853a")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("donors.all_groups_15b06f")}</SelectItem>
              {groups.map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">{t("donors.from_b4afab")}</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label className="mb-2 block">{t("donors.k_a0eff4")}</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={handleResetFilters} title={t("donors.k_6881e6")} className="mb-[1px]">
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
                <p className="text-sm font-medium text-muted-foreground">{t("donors.k_2ddc42")}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Sources</p>
                <h3 className="text-2xl font-bold mt-1">{summary.uniqueDonors}</h3>
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
              <p className="text-sm font-medium text-muted-foreground">{t("donors.total_transactions_86d5c2")}</p>
              <h3 className="text-2xl font-bold mt-1">{summary.totalTransactions} {t("donors.k_600e65")}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className={selectedDonor !== "ALL" ? "bg-emerald-500/10 border-emerald-500/20" : ""}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("donors.total_amount_2f6775")}</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">৳{formatCurrency(summary.totalAmount)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="print:shadow-none print:border-none print:m-0">
        <div className="flex justify-between items-center p-4 border-b hide-print">
          <h2 className="text-lg font-semibold">{t("donors.ledger_entries_4f872d")}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> {t("donors.excel_csv_b5be46")}</Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> {t("donors.pdf_c93abc")}</Button>
          </div>
        </div>

        {/* Print Header (Hidden on screen) */}
        <div className="hidden print:block text-center pb-6 mb-6 border-b">
          <h1 className="text-2xl font-bold">{branding?.foundationName || "Foundation ERP"}</h1>
          <h2 className="text-xl font-semibold mt-1">{t("donors.master_ledger_ab8201")}</h2>
          {selectedDonor !== "ALL" && activeDonor && (
            <div className="mt-2 text-sm">
              <p>{t("donors.k_4f08c3")}<strong>{activeDonor.fullName}</strong> ({activeDonor.donorId})</p>
              <p>{t("donors.k_9767a6")}{activeDonor.mobile}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {t("donors.k_791ec1")}{printDate}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">{t("donors.k_3e10c2")}</th>
                <th className="px-4 py-3 font-medium">{t("donors.k_390ea9")}</th>
                <th className="px-4 py-3 font-medium">{t("donors.donation_source")}</th>
                <th className="px-4 py-3 font-medium">Donated By</th>
                <th className="px-4 py-3 font-medium">{t("donors.group_d4d811")}</th>
                <th className="px-4 py-3 font-medium">{t("donors.k_e147d5")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("donors.amount_261c82")}</th>
                <th className="px-4 py-3 font-medium text-right">{t("donors.k_b13101")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dataWithBalance.length > 0 ? (
                dataWithBalance.map((row) => {
                  const isMember = row.sourceType === "MEMBER"
                  return (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>{formatDate(row.date)}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{row.voucherNo}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isMember ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" />
                            <span>{t("donors.source_member")}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-primary text-primary text-[10px] flex items-center gap-1 w-fit">
                            <Users className="w-3 h-3" />
                            <span>{t("donors.source_donor")}</span>
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isMember ? (
                          <>
                            <div className="font-medium text-foreground">{row.member?.fullName || "Foundation Member"}</div>
                            <div className="text-xs text-muted-foreground">{row.member?.memberId || row.memberId}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-foreground">{row.donor?.fullName || "External Donor"}</div>
                            <div className="text-xs text-muted-foreground">{row.donor?.mobile || row.donor?.donorId}</div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">{row.groupName}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={row.remarks}>
                        {row.remarks || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium font-mono">
                        ৳{formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary font-mono">
                        ৳{formatCurrency(row.runningBalance)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    {t("donors.k_31c268")}</td>
                </tr>
              )}
            </tbody>
            {/* Footer row for Totals */}
            {dataWithBalance.length > 0 && (
              <tfoot className="bg-muted/50 font-bold border-t-2">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right">{t("donors.total_amount_195a6a")}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-mono">৳{formatCurrency(summary.totalAmount)}</td>
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
