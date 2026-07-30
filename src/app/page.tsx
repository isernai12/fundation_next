import { formatCurrency } from "@/lib/format"
import { getDashboardStats } from "@/features/dashboard/actions"

import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { KpiCard } from "@/components/ui/kpi-card"
import { Wallet, TrendingUp, Coins, Minus, LineChart, RefreshCcw, TrendingDown, Users, Building2, Landmark, Gift } from "lucide-react"

export default async function DashboardPage() {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) redirect("/login")

  const stats = await getDashboardStats()

  return (
    <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up delay-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[22px] font-bold text-surface-950 tracking-tight">নির্বাহী ড্যাশবোর্ড</h2>
              <span className="badge-custom bg-accent-green/10 text-accent-emerald">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full" style={{ animation: 'pulse-soft 2s infinite' }}></span>
                লাইভ
              </span>
            </div>
            <p className="text-[13px] text-surface-500">ফাউন্ডেশনের কার্যক্রম ও আর্থিক অবস্থার সারসংক্ষেপ</p>
          </div>
        </div>

        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Total Cash Balance */}
          <KpiCard
            title="মোট নগদ স্থিতি"
            value={<>৳{formatCurrency(stats.currentCashBalance)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue="গত মাসের ৳5,066 এর তুলনায়"
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
            title="ফাউন্ডেশন তহবিল"
            value={<>৳{formatCurrency(stats.foundationTotalFund)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue="গত মাসের তুলনায় কোনো পরিবর্তন নেই"
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
            title="গ্রুপ তহবিল"
            value={<>৳{formatCurrency(stats.totalGroupFunds)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue="গত মাসের ৳4,990 এর তুলনায়"
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
            title="মাসিক চাঁদা"
            value={<>৳{formatCurrency(stats.totalContributions)}<span className="text-[18px] text-surface-500 font-medium">.00</span></>}
            subValue="গত মাসের ৳203 এর তুলনায়"
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
            title="সদস্য"
            value={stats.totalMembers.toString()}
            subValue={`${stats.inactiveMembers} নিষ্ক্রিয় সদস্য`}
            icon={Users}
            badgeLabel={`${stats.activeMembers} সক্রিয়`}
            badgeVariant="info"
            delayClass="delay-5"
            accentColor="#3b82f6"
            shadowHover="rgba(59, 130, 246, 0.1)"
            dotColor="#3b82f6"
          />

          {/* Groups / Beneficiaries */}
          <KpiCard
            title="গ্রুপ / উপকারভোগী"
            value={<>{stats.totalGroups} <span className="text-[18px] text-surface-400 font-normal">/</span> <span className="text-[32px]">{stats.totalBeneficiaries}</span></>}
            subValue="সক্রিয় প্রতিষ্ঠান"
            icon={Building2}
            badgeLabel="মোট"
            badgeVariant="neutral"
            delayClass="delay-6"
            accentColor="#f43f5e"
            shadowHover="rgba(244, 63, 94, 0.1)"
            dotColor="#f43f5e"
          />

          {/* Active Loans */}
          <KpiCard
            title="সক্রিয় ঋণ"
            value={stats.totalActiveLoans.toString()}
            subValue={stats.outstandingLoanAmount === 0 ? "কোনো বকেয়া নেই" : `৳${formatCurrency(stats.outstandingLoanAmount)} বকেয়া`}
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
            title="মোট অনুদান"
            value={stats.totalGrants.toString()}
            subValue={stats.totalGrants === 0 ? "কোনো সক্রিয় অনুদান নেই" : "অনুমোদিত অনুদান"}
            icon={Gift}
            badgeLabel="অনুমোদিত"
            badgeVariant="neutral"
            delayClass="delay-8"
            accentColor="#a855f7"
            shadowHover="rgba(168, 85, 247, 0.1)"
            dotColor="#a855f7"
          />
        </div>


    </div>
  )
}
