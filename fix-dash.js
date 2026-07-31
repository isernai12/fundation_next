const fs = require('fs');

const keysToAdd = [
  'total_cash_balance', 'compared_to_last_month', 'foundation_fund', 'no_change',
  'group_funds', 'monthly_contributions', 'members', 'inactive_members', 'active',
  'groups_beneficiaries', 'active_institutions', 'total', 'active_loans', 'no_dues',
  'dues', 'total_grants', 'no_active_grants', 'approved_grants', 'approved'
];

function updateDashboard(lang) {
  const legacyFile = `src/i18n/locales/${lang}.json`;
  const legacyData = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
  
  const dashboardFile = `src/i18n/dictionaries/${lang}/dashboard.json`;
  const dashboardData = JSON.parse(fs.readFileSync(dashboardFile, 'utf8'));

  keysToAdd.forEach(k => {
    // If it's in legacy as dashboard.something, get it
    const val = legacyData[`dashboard.${k}`] || legacyData[k] || k.replace(/_/g, ' ');
    // capitalize nicely if english
    if (lang === 'en' && val === k.replace(/_/g, ' ')) {
       dashboardData[k] = val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else {
       dashboardData[k] = val;
    }
  });

  fs.writeFileSync(dashboardFile, JSON.stringify(dashboardData, null, 2));
}

updateDashboard('en');
updateDashboard('bn');

// Also update page.tsx to change app.text to common.dashboard
let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
pageContent = pageContent.replace(/app\.text/g, 'common.dashboard');
fs.writeFileSync('src/app/page.tsx', pageContent);

console.log('Dashboard and page updated');
