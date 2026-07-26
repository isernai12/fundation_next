const fs = require('fs');

// 1. Restore page.tsx
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');
page = page.replace(
  /WelcomeSection,\n\s*KpiCard,\n\s*QuickActions,[\s\S]*?SystemStatus\n\} from "@\/features\/dashboard\/components\/dashboard-ui"/,
  `WelcomeSection,
  KpiCard,
  QuickActions,
  TodaysTasks,
  OverdueAlerts,
  UpcomingTasks,
  TodaysFinancialSummary,
  SystemStatus
} from "@/features/dashboard/components/dashboard-ui"`
);
page = page.replace(/const userName = user\?\.name \|\| "Administrator"/, 'const userName = user?.name || "অ্যাডমিনিস্ট্রেটর"');
page = page.replace(/<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">[\s\S]*?<\/div>\n    <\/div>/, `<div className="grid grid-cols-1 gap-6 pt-2">
        <QuickActions />
        
        {/* Action Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TodaysTasks />
          <OverdueAlerts />
          <UpcomingTasks />
        </div>

        {/* Charts & Financials Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <TodaysFinancialSummary />
            {/* Dynamic charts to preserve functionality */}
            <div className="rounded-xl border border-border/50 bg-card shadow-card p-4">
              <DashboardCharts monthlyData={stats.monthlyChartData} groupFundData={stats.groupFundDistribution} />
            </div>
          </div>

          {/* Right Sidebar Column (1/3) */}
          <div className="space-y-6">
            <SystemStatus />
          </div>
        </div>
      </div>
    </div>`);
page = page.replace(/title="Total Members"/, 'title="মোট সদস্য"').replace(/subtitle={`\$\{stats.activeMembers\} Active`}/, 'subtitle={`${stats.activeMembers} জন সক্রিয়`}');
page = page.replace(/title="Total Donors"/, 'title="মোট অনুদানদাতা"').replace(/subtitle="Registered"/, 'subtitle="নিবন্ধিত"');
page = page.replace(/title="Active Groups"/, 'title="সক্রিয় গ্রুপ"').replace(/subtitle="Across regions"/, 'subtitle="সকল অঞ্চল জুড়ে"');
page = page.replace(/title="Active Loans"/, 'title="সক্রিয় ঋণ"').replace(/subtitle={`৳\$\{formatCurrency\(stats.outstandingLoanAmount\)\} Due`}/, 'subtitle={`৳${formatCurrency(stats.outstandingLoanAmount)} বকেয়া`}').replace(/trendValue="Stable"/, 'trendValue="স্থিতিশীল"');
page = page.replace(/title="Available Funds"/, 'title="উপলব্ধ তহবিল"').replace(/subtitle="Total Balance"/, 'subtitle="মোট স্থিতি"');
page = page.replace(/title="Monthly Collections"/, 'title="মাসিক সংগ্রহ"').replace(/subtitle="Lifetime total"/, 'subtitle="সর্বমোট সংগ্রহ"');
fs.writeFileSync('src/app/page.tsx', page);

// 2. Restore header.tsx
let header = fs.readFileSync('src/components/layout/header.tsx', 'utf-8');
header = header.replace(
  /const currentPage = pathSegments\.length > 0\s*\n\s*\? pathSegments\[pathSegments\.length - 1\]\.charAt\(0\)\.toUpperCase\(\) \+ pathSegments\[pathSegments\.length - 1\]\.slice\(1\)\s*\n\s*: "Overview"/,
  `const breadcrumbMap: Record<string, string> = {
    'members': 'সদস্য',
    'donors': 'অনুদানদাতা',
    'groups': 'গ্রুপ',
    'loans': 'ঋণ',
    'contributions': 'তহবিল / চাঁদা',
    'beneficiaries': 'সুবিধাভোগী',
    'campaigns': 'তহবিল কার্যক্রম',
    'grants': 'অনুদান',
    'settings': 'সেটিংস',
    'profile': 'প্রোফাইল'
  }
  
  const rawSegment = pathSegments.length > 0 ? pathSegments[0] : ''
  const currentPage = rawSegment 
    ? (breadcrumbMap[rawSegment] || rawSegment.charAt(0).toUpperCase() + rawSegment.slice(1))
    : "সারসংক্ষেপ"`
);
header = header.replace(/placeholder="Search anywhere\.\.\."/, 'placeholder="যেকোনো কিছু খুঁজুন..."');
header = header.replace(/<span>New Action<\/span>/, '<span>নতুন কার্যক্রম</span>');
header = header.replace(/<span className="sr-only">Notifications<\/span>/, '<span className="sr-only">নোটিফিকেশন</span>');
header = header.replace(/{session\?\.user\?\.name \|\| "Administrator"}/, '{session?.user?.name || "সিস্টেম প্রশাসক"}');
header = header.replace(/<span>My Profile<\/span>/, '<span>আমার প্রোফাইল</span>');
header = header.replace(/<span>Settings<\/span>/, '<span>সেটিংস</span>');
header = header.replace(/<span>Log out<\/span>/, '<span>লগ আউট</span>');
fs.writeFileSync('src/components/layout/header.tsx', header);

// 3. Restore sidebar.tsx
let sidebar = fs.readFileSync('src/components/layout/sidebar.tsx', 'utf-8');
sidebar = sidebar.replace(/Foundation ERP/g, 'ফাউন্ডেশন ইআরপি');
sidebar = sidebar.replace(/Main Navigation/g, 'প্রধান মেনু');
fs.writeFileSync('src/components/layout/sidebar.tsx', sidebar);

// 4. Restore dashboard-charts.tsx
let charts = fs.readFileSync('src/features/dashboard/components/dashboard-charts.tsx', 'utf-8');
charts = charts.replace(/<Card className="col-span-4">/, '<Card className="col-span-4 shadow-none border-none bg-transparent">');
charts = charts.replace(/<CardHeader>/, '<CardHeader className="px-0 pt-0">');
charts = charts.replace(/<CardTitle>Monthly Financials Overview<\/CardTitle>/, '<CardTitle className="text-sm font-medium">মাসিক আর্থিক সারসংক্ষেপ</CardTitle>');
charts = charts.replace(/name="Contributions"/, 'name="তহবিল সংগ্রহ"');
charts = charts.replace(/name="Loans Disbursed"/, 'name="প্রদত্ত ঋণ"');
charts = charts.replace(/name="Grants"/, 'name="অনুদান"');
charts = charts.replace(/<Card className="col-span-3">/, '<Card className="col-span-3 shadow-none border-none bg-transparent">');
charts = charts.replace(/<CardHeader>/, '<CardHeader className="px-0 pt-0">');
charts = charts.replace(/<CardTitle>Group Fund Distribution<\/CardTitle>/, '<CardTitle className="text-sm font-medium">গ্রুপ ফান্ড বন্টন</CardTitle>');
fs.writeFileSync('src/features/dashboard/components/dashboard-charts.tsx', charts);

// 5. Restore dashboard actions.ts
let actions = fs.readFileSync('src/features/dashboard/actions.ts', 'utf-8');
actions = actions.replace('import { prisma } from "@/lib/prisma"', 'import { prisma } from "@/lib/prisma"\nimport { getNow, toDhakaTime } from "@/lib/date"');
actions = actions.replace('const sixMonthsAgo = new Date()', 'const now = getNow()\n  const sixMonthsAgo = new Date(now)');
actions = actions.replace(/for \(let i = 5; i >= 0; i--\) \{[\s\S]*?const d = new Date\(\)[\s\S]*?d\.setMonth\(d\.getMonth\(\) - i\)[\s\S]*?const monthStr = formatShortMonth\(new Date\(d\)\.getUTCMonth\(\)\)[\s\S]*?monthMap\.set\(monthStr, \{ month: monthStr, contributions: 0, loans: 0, grants: 0 \}\)[\s\S]*?\}/, `for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const monthStr = formatShortMonth(d.getMonth())
    monthMap.set(monthStr, { month: monthStr, contributions: 0, loans: 0, grants: 0 })
  }`);
actions = actions.replace(/const m = formatShortMonth\(new Date\(c\.createdAt\)\.getUTCMonth\(\)\)/, 'const dhakaDate = toDhakaTime(c.createdAt)\n    const m = formatShortMonth(dhakaDate.getMonth())');
actions = actions.replace(/const m = formatShortMonth\(new Date\(l\.createdAt\)\.getUTCMonth\(\)\)/, 'const dhakaDate = toDhakaTime(l.createdAt)\n    const m = formatShortMonth(dhakaDate.getMonth())');
actions = actions.replace(/const m = formatShortMonth\(new Date\(g\.createdAt\)\.getUTCMonth\(\)\)/, 'const dhakaDate = toDhakaTime(g.createdAt)\n    const m = formatShortMonth(dhakaDate.getMonth())');
fs.writeFileSync('src/features/dashboard/actions.ts', actions);

// 6. Restore format.ts
let format = fs.readFileSync('src/lib/format.ts', 'utf-8');
format = `import { formatDate as formatDateTz, formatTimeBangla } from './date';\n` + format;
format = format.replace(/export function formatDate\([\s\S]*?\{[\s\S]*?\n\}/, `export function formatDate(date: string | Date | number | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return formatDateTz(d);
}`);
format = format.replace(/export function formatDateTime\([\s\S]*?\{[\s\S]*?\n\}/, `export function formatDateTime(date: string | Date | number | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return \`\${formatDateTz(d)}, \${formatTimeBangla(d)}\`;
}`);
fs.writeFileSync('src/lib/format.ts', format);

console.log('Restored all files successfully!');
