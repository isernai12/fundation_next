import { formatCurrency } from "@/lib/format"
import { getDashboardStats } from "@/features/dashboard/actions"

import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { KpiCard } from "@/components/ui/kpi-card"
import { Wallet, TrendingUp, Coins, Minus, LineChart, RefreshCcw, TrendingDown, Users, Building2, Landmark, Gift } from "lucide-react"
import { Trans } from "@/components/shared/trans";

import { Suspense } from "react"

export default async function DashboardPage() {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) redirect("/login")
  
  return (
    <div className="space-y-4">
        {/* Page Header (Loads Instantly) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up delay-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[22px] font-bold text-surface-950 tracking-tight"><Trans tKey="dashboard.executive_dashboard" /></h2>
              <span className="badge-custom bg-accent-green/10 text-accent-emerald">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full" style={{ animation: 'pulse-soft 2s infinite' }}></span>
                <Trans tKey="dashboard.live" /></span>
            </div>
            <p className="text-[13px] text-surface-500"><Trans tKey="dashboard.dashboard_description" /></p>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardStats />
        </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Row 1 Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={`r1-${i}`} className="h-32 bg-surface-100/50 dark:bg-surface-800/30 rounded-xl border border-surface-200/50 dark:border-surface-800/50 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-surface-200 dark:bg-surface-800 rounded"></div>
              <div className="h-8 w-8 bg-surface-200 dark:bg-surface-800 rounded-full"></div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-7 w-32 bg-surface-200 dark:bg-surface-800 rounded"></div>
              <div className="h-3 w-16 bg-surface-200 dark:bg-surface-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Row 2 Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={`r2-${i}`} className="h-32 bg-surface-100/50 dark:bg-surface-800/30 rounded-xl border border-surface-200/50 dark:border-surface-800/50 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-4 w-28 bg-surface-200 dark:bg-surface-800 rounded"></div>
              <div className="h-8 w-8 bg-surface-200 dark:bg-surface-800 rounded-full"></div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-7 w-20 bg-surface-200 dark:bg-surface-800 rounded"></div>
              <div className="h-3 w-24 bg-surface-200 dark:bg-surface-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function DashboardStats() {
  const stats = await getDashboardStats()
  
  return (
    <>
        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Total Cash Balance */}
          <KpiCard
            title={<Trans tKey="dashboard.total_cash_balance" />}
            value={<>৳{formatCurrency(stats.currentCashBalance)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue={<><Trans tKey="dashboard.compared_to_last_month" /> ৳5,066</>}
            icon={Wallet}
            badgeLabel="+12.5%"
            badgeIcon={TrendingUp}
            badgeVariant="up"
            delayClass="delay-1"
            accentColor="#6366f1"
            shadowHover="rgba(99, 102, 241, 0.1)"
            dotColor="#6366f1"
          />

          {/* Foundation Fund */}
          <KpiCard
            title={<Trans tKey="dashboard.foundation_fund" />}
            value={<>৳{formatCurrency(stats.foundationTotalFund)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue={<Trans tKey="dashboard.no_change" />}
            icon={Coins}
            badgeLabel="0.0%"
            badgeIcon={Minus}
            badgeVariant="neutral"
            delayClass="delay-2"
            accentColor="#ec4899"
            shadowHover="rgba(236, 72, 153, 0.1)"
            dotColor="#ec4899"
          />

          {/* Group Funds */}
          <KpiCard
            title={<Trans tKey="dashboard.group_funds" />}
            value={<>৳{formatCurrency(stats.totalGroupFunds)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue={<><Trans tKey="dashboard.compared_to_last_month" /> ৳4,990</>}
            icon={LineChart}
            badgeLabel="+4.2%"
            badgeIcon={TrendingUp}
            badgeVariant="up"
            delayClass="delay-3"
            accentColor="#06b6d4"
            shadowHover="rgba(6, 182, 212, 0.1)"
            dotColor="#06b6d4"
          />

          {/* Monthly Contributions */}
          <KpiCard
            title={<Trans tKey="dashboard.monthly_contributions" />}
            value={<>৳{formatCurrency(stats.totalContributions)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue={<><Trans tKey="dashboard.compared_to_last_month" /> ৳203</>}
            icon={RefreshCcw}
            badgeLabel="-1.5%"
            badgeIcon={TrendingDown}
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
            title={<Trans tKey="dashboard.members" />}
            value={stats.totalMembers.toString()}
            subValue={<>{stats.inactiveMembers} <Trans tKey="dashboard.inactive_members" /></>}
            icon={Users}
            badgeLabel={<>{stats.activeMembers} <Trans tKey="dashboard.active" /></>}
            badgeVariant="info"
            delayClass="delay-5"
            accentColor="#3b82f6"
            shadowHover="rgba(59, 130, 246, 0.1)"
            dotColor="#3b82f6"
          />

          {/* Groups / Beneficiaries */}
          <KpiCard
            title={<Trans tKey="dashboard.groups_beneficiaries" />}
            value={<>{stats.totalGroups} <span className="text-[18px] text-surface-400 font-normal">/</span> <span className="text-[32px]">{stats.totalBeneficiaries}</span></>}
            subValue={<Trans tKey="dashboard.active_institutions" />}
            icon={Building2}
            badgeLabel={<Trans tKey="dashboard.total" />}
            badgeVariant="neutral"
            delayClass="delay-6"
            accentColor="#f43f5e"
            shadowHover="rgba(244, 63, 94, 0.1)"
            dotColor="#f43f5e"
          />

          {/* Active Loans */}
          <KpiCard
            title={<Trans tKey="dashboard.active_loans" />}
            value={stats.totalActiveLoans.toString()}
            subValue={stats.outstandingLoanAmount === 0 ? <Trans tKey="dashboard.no_dues" /> : <>৳{formatCurrency(stats.outstandingLoanAmount)} <Trans tKey="dashboard.dues" /></>}
            icon={Landmark}
            badgeLabel={`৳${formatCurrency(stats.outstandingLoanAmount)}`}
            badgeVariant="neutral"
            delayClass="delay-7"
            accentColor="#10b981"
            shadowHover="rgba(16, 185, 129, 0.1)"
            dotColor="#10b981"
          />

          {/* Total Grants */}
          <KpiCard
            title={<Trans tKey="dashboard.total_grants" />}
            value={stats.totalGrants.toString()}
            subValue={stats.totalGrants === 0 ? <Trans tKey="dashboard.no_active_grants" /> : <Trans tKey="dashboard.approved_grants" />}
            icon={Gift}
            badgeLabel={<Trans tKey="dashboard.approved" />}
            badgeVariant="neutral"
            delayClass="delay-8"
            accentColor="#a855f7"
            shadowHover="rgba(168, 85, 247, 0.1)"
            dotColor="#a855f7"
          />
        </div>
    </>
  )
}

