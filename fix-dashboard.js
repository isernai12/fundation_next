const fs = require('fs');

// 1. Fix globals.css
const cssPath = './src/app/globals.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent = cssContent.replace(/\.kpi-card \{\s*transition: all 0\.3s cubic-bezier\(0\.16, 1, 0\.3, 1\);\s*\}\s*\.kpi-card:hover \{\s*transform: translateY\(-2px\);\s*box-shadow: 0 8px 30px -8px rgba\(99, 88, 245, 0\.12\), 0 1px 3px rgba\(0,0,0,0\.04\);\s*border-color: rgba\(99, 88, 245, 0\.2\);\s*\}/g, 
`.kpi-card {
  transition: all 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevation-2);
}`);
fs.writeFileSync(cssPath, cssContent);

// 2. Fix page.tsx
const pagePath = './src/app/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

const minimalCard = (icon, title, value, subtitle, delay, badge = null) => `          <div className="kpi-card bg-surface-0 rounded-xl border border-surface-200 p-6 relative overflow-hidden animate-fade-up ${delay} group shadow-sm">
            {/* Watermark Icon */}
            <span className="material-symbols-outlined absolute -bottom-6 -right-4 text-[120px] text-surface-900 opacity-[0.03] dark:opacity-[0.06] pointer-events-none group-hover:scale-105 transition-transform duration-500">${icon}</span>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="material-symbols-outlined text-surface-500">${icon}</span>
              ${badge ? badge : ''}
            </div>
            
            <div className="relative z-10">
              <p className="text-[13px] font-medium text-surface-500">${title}</p>
              <p className="text-[28px] font-semibold text-surface-950 tracking-tight mt-1">${value}</p>
              <p className="text-[12px] text-surface-400 mt-2">${subtitle}</p>
            </div>
          </div>`;

const badgeLiveGreen = `<span className="badge-custom bg-accent-green/10 text-accent-emerald"><span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>Live</span>`;
const badgeLiveGray = `<span className="badge-custom bg-surface-100 text-surface-500"><span className="w-1.5 h-1.5 bg-surface-400 rounded-full"></span>Live</span>`;
const badgeLiveRed = `<span className="badge-custom bg-accent-red/10 text-accent-red"><span className="w-1.5 h-1.5 bg-accent-red rounded-full"></span>Live</span>`;


const newCards1 = `        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
${minimalCard('account_balance_wallet', 'Total Cash Balance', '৳{formatCurrency(stats.currentCashBalance)}', 'Across all ledgers', 'delay-2', badgeLiveGreen)}
${minimalCard('monetization_on', 'Foundation Fund', '৳{formatCurrency(stats.foundationTotalFund)}', 'General Fund Equity', 'delay-3', badgeLiveGray)}
${minimalCard('show_chart', 'Group Funds', '৳{formatCurrency(stats.totalGroupFunds)}', 'Across all groups', 'delay-4', badgeLiveGreen)}
${minimalCard('autorenew', 'Monthly Contributions', '৳{formatCurrency(stats.totalContributions)}', 'Lifetime collected', 'delay-5', badgeLiveRed)}
        </div>`;

const newCards2 = `        {/* KPI Cards Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
${minimalCard('person', 'Members', '{stats.totalMembers}', '<span className="text-surface-600 font-medium">{stats.activeMembers} Active</span> &middot; {stats.inactiveMembers} Inactive', 'delay-6')}
${minimalCard('corporate_fare', 'Groups / Beneficiaries', '{stats.totalGroups} <span className="text-[18px] text-surface-300 font-normal">/</span> <span className="text-[24px]">{stats.totalBeneficiaries}</span>', 'Total registered counts', 'delay-7')}
${minimalCard('real_estate_agent', 'Active Loans', '{stats.totalActiveLoans}', '৳{formatCurrency(stats.outstandingLoanAmount)} Outstanding', 'delay-8')}
${minimalCard('card_giftcard', 'Total Grants', '{stats.totalGrants}', 'Approved grants', 'delay-9')}
        </div>`;

const row1Regex = /\{\/\* KPI Cards Row 1 \*\/\}.*?(?=\{\/\* KPI Cards Row 2 \*\/})/s;
pageContent = pageContent.replace(row1Regex, newCards1 + '\n\n');

const row2Regex = /\{\/\* KPI Cards Row 2 \*\/\}.*?(?=\n\n\s*<\/div>\n\s*<\/div>)/s;
pageContent = pageContent.replace(row2Regex, newCards2);

fs.writeFileSync(pagePath, pageContent);

