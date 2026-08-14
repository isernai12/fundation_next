"use client"

import React from "react"
import { formatCurrency } from "@/lib/format"
import type { ContributionLedgerItem, LedgerSummaryStats } from "../ledger-actions"

export interface LedgerPrintTemplateProps {
  foundationName?: string
  foundationLogo?: string | null
  title: string
  subtitle?: string
  dateRangeStr?: string
  printedBy?: string
  printedTime?: string
  memberInfo?: {
    memberId: string
    fullName: string
    mobile: string
    groupName: string
    status: string
  } | null
  previousBalance?: number
  items: ContributionLedgerItem[]
  summary?: LedgerSummaryStats | null
}

export function LedgerPrintTemplate({
  foundationName = "Foundation ERP",
  foundationLogo,
  title,
  subtitle,
  dateRangeStr = "All Time",
  printedBy = "Admin",
  printedTime = new Date().toLocaleString(),
  memberInfo,
  previousBalance = 0,
  items,
  summary,
}: LedgerPrintTemplateProps) {
  return (
    <div className="print-template p-6 bg-white text-black font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4">
        <div className="flex items-center gap-3">
          {foundationLogo ? (
            <img src={foundationLogo} alt="Foundation Logo" className="h-12 w-12 object-contain" />
          ) : (
            <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
              FE
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">{foundationName}</h1>
            <p className="text-xs text-gray-500">{subtitle || "Official Financial Ledger Statement"}</p>
          </div>
        </div>

        <div className="text-right text-xs text-gray-600">
          <p className="font-semibold text-sm text-gray-800">{title}</p>
          <p>Date Range: {dateRangeStr}</p>
          <p>Printed: {printedTime}</p>
          <p>Printed By: {printedBy}</p>
        </div>
      </div>

      {/* Member Details Banner (If Member Ledger) */}
      {memberInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-gray-500 block">Member ID:</span>
            <span className="font-bold text-gray-800">{memberInfo.memberId}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Member Name:</span>
            <span className="font-bold text-gray-800">{memberInfo.fullName}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Mobile:</span>
            <span className="font-bold text-gray-800">{memberInfo.mobile}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Group / Status:</span>
            <span className="font-bold text-gray-800">{memberInfo.groupName} ({memberInfo.status})</span>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-center text-xs">
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <span className="text-gray-500 block">Previous Balance</span>
          <span className="font-bold text-sm text-gray-800">৳ {formatCurrency(previousBalance)}</span>
        </div>
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <span className="text-gray-500 block">Total Contributions</span>
          <span className="font-bold text-sm text-emerald-700">৳ {formatCurrency(summary?.totalContributions || 0)}</span>
        </div>
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <span className="text-gray-500 block">Total Refunds / Debits</span>
          <span className="font-bold text-sm text-rose-700">৳ {formatCurrency(summary?.totalRefund || 0)}</span>
        </div>
        <div className="border border-gray-200 rounded p-2 bg-gray-50">
          <span className="text-gray-500 block">Net Closing Balance</span>
          <span className="font-bold text-sm text-blue-700">৳ {formatCurrency(summary?.currentBalance ?? (previousBalance + (summary?.totalContributions || 0) - (summary?.totalRefund || 0)))}</span>
        </div>
      </div>

      {/* Ledger Table */}
      <table className="w-full text-left text-xs border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300 font-semibold text-gray-700">
            <th className="p-2 border border-gray-300">Date</th>
            <th className="p-2 border border-gray-300">Receipt No</th>
            {!memberInfo && <th className="p-2 border border-gray-300">Member</th>}
            <th className="p-2 border border-gray-300">Type</th>
            <th className="p-2 border border-gray-300 text-right">Debit (৳)</th>
            <th className="p-2 border border-gray-300 text-right">Credit (৳)</th>
            <th className="p-2 border border-gray-300 text-right">Balance (৳)</th>
            <th className="p-2 border border-gray-300">Method</th>
            <th className="p-2 border border-gray-300">Collector</th>
            <th className="p-2 border border-gray-300">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {/* Previous Balance Row */}
          {previousBalance !== 0 && (
            <tr className="bg-gray-50 font-medium border-b border-gray-200 text-gray-600">
              <td className="p-2 border border-gray-300" colSpan={!memberInfo ? 6 : 5}>
                Opening / Previous Balance
              </td>
              <td className="p-2 border border-gray-300 text-right font-bold" colSpan={2}>
                ৳ {formatCurrency(previousBalance)}
              </td>
              <td className="p-2 border border-gray-300" colSpan={3}></td>
            </tr>
          )}

          {items.length === 0 ? (
            <tr>
              <td colSpan={!memberInfo ? 10 : 9} className="p-6 text-center text-gray-500 italic">
                No ledger transactions found for the selected period.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 border border-gray-300 whitespace-nowrap">{item.paymentDate.split("T")[0]}</td>
                <td className="p-2 border border-gray-300 font-mono text-[10px]">{item.receiptNo}</td>
                {!memberInfo && (
                  <td className="p-2 border border-gray-300">
                    <span className="font-semibold block">{item.memberName}</span>
                    <span className="text-[10px] text-gray-500">{item.memberId}</span>
                  </td>
                )}
                <td className="p-2 border border-gray-300">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    item.contributionType === "REFUND"
                      ? "bg-red-100 text-red-800"
                      : item.contributionType === "ADDITIONAL"
                      ? "bg-purple-100 text-purple-800"
                      : item.contributionType === "ADJUSTMENT"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {item.contributionType}
                  </span>
                </td>
                <td className="p-2 border border-gray-300 text-right text-rose-700 font-mono">
                  {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                </td>
                <td className="p-2 border border-gray-300 text-right text-emerald-700 font-mono">
                  {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                </td>
                <td className="p-2 border border-gray-300 text-right font-bold font-mono">
                  {formatCurrency(item.balance)}
                </td>
                <td className="p-2 border border-gray-300">{item.paymentMethod}</td>
                <td className="p-2 border border-gray-300">{item.collector}</td>
                <td className="p-2 border border-gray-300 text-gray-600 max-w-[150px] truncate">{item.remarks || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-end text-xs text-gray-500">
        <div>
          <p className="font-semibold text-gray-700">{foundationName}</p>
          <p>This is a computer-generated statement. No signature required.</p>
        </div>
        <div className="text-right">
          <div className="w-32 border-b border-gray-400 mb-1"></div>
          <p className="font-semibold text-gray-700">Authorized Signature</p>
        </div>
      </div>
    </div>
  )
}
