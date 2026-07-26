
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Wallet,
  CalendarDays,
  FileText,
  BadgeAlert
} from "lucide-react"

import { getNow, formatDate } from "@/lib/date"

export function WelcomeSection({ userName }: { userName: string }) {
  const today = formatDate(getNow())

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">স্বাগতম, {userName}</h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="bg-background shadow-sm h-9">রিপোর্ট ডাউনলোড</Button>
      </div>
    </div>
  )
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}) {
  return (
    <Card className="shadow-card border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-muted-foreground'}`}>
              {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
              {trend === 'down' && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActions() {
  const actions = [
    { label: "নতুন সদস্য", icon: Plus, color: "bg-blue-500/10 text-blue-600" },
    { label: "কিস্তি গ্রহণ", icon: Wallet, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "চাঁদা সংগ্রহ", icon: FileText, color: "bg-indigo-500/10 text-indigo-600" },
    { label: "অনুদান গ্রহণ", icon: Plus, color: "bg-teal-500/10 text-teal-600" },
    { label: "ঋণ প্রদান", icon: Plus, color: "bg-amber-500/10 text-amber-600" },
  ]

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-medium">দ্রুত কার্যক্রম</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {actions.map((action, i) => (
          <button key={i} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors gap-2 group">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-[13px] font-medium text-foreground text-center">{action.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType, title: string, description: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4 rounded-lg border border-dashed border-border/60 bg-muted/20 h-full min-h-[200px]">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-[250px] mb-4">{description}</p>
      {action}
    </div>
  )
}

export function TodaysTasks() {
  return (
    <Card className="shadow-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">আজকের কাজসমূহ</CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <EmptyState 
          icon={Calendar} 
          title="কোনো কাজ নেই" 
          description="আজকের জন্য কোনো ঋণের কিস্তি, চাঁদা বা অনুমোদনের কাজ বাকি নেই।"
        />
      </CardContent>
    </Card>
  )
}

export function OverdueAlerts() {
  return (
    <Card className="shadow-card border-border/50 border-t-4 border-t-rose-500 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BadgeAlert className="h-4 w-4 text-rose-500" />
          বকেয়া সতর্কতা
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <EmptyState 
          icon={CheckCircle2} 
          title="সব ঠিক আছে!" 
          description="বর্তমানে কোনো বকেয়া কিস্তি বা মাসিক চাঁদা নেই।"
        />
      </CardContent>
    </Card>
  )
}

export function UpcomingTasks() {
  return (
    <Card className="shadow-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">আসন্ন (আগামী ৭ দিন)</CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <EmptyState 
          icon={CalendarDays} 
          title="কোনো আসন্ন কাজ নেই" 
          description="আগামী ৭ দিনের জন্য কোনো কাজ নির্ধারিত নেই।"
        />
      </CardContent>
    </Card>
  )
}

export function TodaysFinancialSummary() {
  return (
    <Card className="shadow-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">আজকের আর্থিক সারসংক্ষেপ</CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <EmptyState 
          icon={Activity} 
          title="কোনো লেনদেন হয়নি" 
          description="আজকের দিনে এখনও পর্যন্ত কোনো আর্থিক লেনদেন রেকর্ড করা হয়নি।"
        />
      </CardContent>
    </Card>
  )
}

export function SystemStatus() {
  const statuses = [
    { label: "ডেটাবেস (Database)", status: "সচল", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "এপিআই সার্ভিস (API Services)", status: "সচল", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "ব্যাকগ্রাউন্ড জবস (Background Jobs)", status: "চলমান", icon: CheckCircle2, color: "text-emerald-500" },
  ]
  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-medium">সিস্টেম স্ট্যাটাস</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {statuses.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-1.5">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs font-medium">{item.status}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
