import { formatCurrency } from "@/lib/format"
import { getDashboardStats } from "@/features/dashboard/actions"

import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { KpiCard } from "@/components/ui/kpi-card"

export default async function DashboardPage() {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) redirect("/login")

  const stats = await getDashboardStats()

  return (
    <div className="flex-1 overflow-y-auto w-full h-full pb-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up delay-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[22px] font-bold text-surface-950 tracking-tight">Executive Dashboard</h2>
              <span className="badge-custom bg-accent-green/10 text-accent-emerald">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full" style={{ animation: 'pulse-soft 2s infinite' }}></span>
                Live
              </span>
            </div>
            <p className="text-[13px] text-surface-500">High-level overview of foundation operations and financials.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-surface-0 border border-surface-200 text-surface-700 rounded-lg text-[13px] font-medium hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined sm">file_download</span>
              Export
            </button>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg text-[13px] font-medium hover:bg-brand-600 transition-all shadow-sm shadow-brand-500/20 flex items-center gap-2">
              <span className="material-symbols-outlined sm">add</span>
              New Transaction
            </button>
          </div>
        </div>

        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Total Cash Balance */}
          <KpiCard
            title="Total Cash Balance"
            value={<>৳{formatCurrency(stats.currentCashBalance)}<span style={{ fontSize: "18px", color: "#94a3b8", fontWeight: 500 }}>.00</span></>}
            subValue="vs ৳5,066 last month"
            icon="account_balance_wallet"
            badgeLabel="+12.5%"
            badgeIcon="trending_up"
            badgeVariant="up"
            delayClass="delay-1"
            accentColor="#6366f1"
            shadowHover="rgba(99, 102, 241, 0.1)"
            dotColor="#6366f1"
          />

          {/* Foundation Fund */}
          <KpiCard
            title="Foundation Fund"
            value={<>৳{formatCurrency(stats.foundationTotalFund)}<span style={{ fontSize: "18px", color: "#94a3b8", fontWeight: 500 }}>.00</span></>}
            subValue="No change from last month"
            icon="monetization_on"
            badgeLabel="0.0%"
            badgeIcon="remove"
            badgeVariant="neutral"
            delayClass="delay-2"
            accentColor="#ec4899"
            shadowHover="rgba(236, 72, 153, 0.1)"
            dotColor="#ec4899"
          />

          {/* Group Funds */}
          <KpiCard
            title="Group Funds"
            value={<>৳{formatCurrency(stats.totalGroupFunds)}<span style={{ fontSize: "18px", color: "#94a3b8", fontWeight: 500 }}>.00</span></>}
            subValue="vs ৳4,990 last month"
            icon="show_chart"
            badgeLabel="+4.2%"
            badgeIcon="trending_up"
            badgeVariant="up"
            delayClass="delay-3"
            accentColor="#06b6d4"
            shadowHover="rgba(6, 182, 212, 0.1)"
            dotColor="#06b6d4"
          />

          {/* Monthly Contributions */}
          <KpiCard
            title="Monthly Contributions"
            value={<>৳{formatCurrency(stats.totalContributions)}<span style={{ fontSize: "18px", color: "#94a3b8", fontWeight: 500 }}>.00</span></>}
            subValue="vs ৳203 last month"
            icon="autorenew"
            badgeLabel="-1.5%"
            badgeIcon="trending_down"
            badgeVariant="down"
            delayClass="delay-4"
            accentColor="#f59e0b"
            shadowHover="rgba(245, 158, 11, 0.1)"
            dotColor="#f59e0b"
          />
        </div>

        {/* KPI Cards Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
          
          {/* Members */}
          <KpiCard
            title="Members"
            value={stats.totalMembers.toString()}
            subValue={`${stats.inactiveMembers} Inactive members`}
            icon="group"
            badgeLabel={`${stats.activeMembers} Active`}
            badgeVariant="info"
            delayClass="delay-5"
            accentColor="#3b82f6"
            shadowHover="rgba(59, 130, 246, 0.1)"
            dotColor="#3b82f6"
          />

          {/* Groups / Beneficiaries */}
          <KpiCard
            title="Groups / Beneficiaries"
            value={<>{stats.totalGroups} <span style={{ fontSize: "18px", color: "#cbd5e1", fontWeight: 400 }}>/</span> <span style={{ fontSize: "32px" }}>{stats.totalBeneficiaries}</span></>}
            subValue="Active organizations"
            icon="corporate_fare"
            badgeLabel="Total"
            badgeVariant="neutral"
            delayClass="delay-6"
            accentColor="#f43f5e"
            shadowHover="rgba(244, 63, 94, 0.1)"
            dotColor="#f43f5e"
          />

          {/* Active Loans */}
          <KpiCard
            title="Active Loans"
            value={stats.totalActiveLoans.toString()}
            subValue={stats.outstandingLoanAmount === 0 ? "No outstanding balance" : `৳${formatCurrency(stats.outstandingLoanAmount)} Outstanding`}
            icon="real_estate_agent"
            badgeLabel={`৳${formatCurrency(stats.outstandingLoanAmount)}`}
            badgeVariant="neutral"
            delayClass="delay-7"
            accentColor="#10b981"
            shadowHover="rgba(16, 185, 129, 0.1)"
            dotColor="#10b981"
          />

          {/* Total Grants */}
          <KpiCard
            title="Total Grants"
            value={stats.totalGrants.toString()}
            subValue={stats.totalGrants === 0 ? "No active grants" : "Approved grants"}
            icon="card_giftcard"
            badgeLabel="Approved"
            badgeVariant="neutral"
            delayClass="delay-8"
            accentColor="#a855f7"
            shadowHover="rgba(168, 85, 247, 0.1)"
            dotColor="#a855f7"
          />
        </div>


      </div>
    </div>
  )
}
