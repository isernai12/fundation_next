const fs = require('fs');
const path = require('path');

const enKeys = {
  "total_cash_balance": "Total Cash Balance",
  "compared_to_last_month": "Compared to last month",
  "foundation_fund": "Foundation Fund",
  "no_change": "No change compared to last month",
  "group_funds": "Group Funds",
  "monthly_contributions": "Monthly Contributions",
  "members": "Members",
  "inactive_members": "Inactive Members",
  "active": "Active",
  "groups_beneficiaries": "Groups / Beneficiaries",
  "active_institutions": "Active Institutions",
  "total": "Total",
  "active_loans": "Active Loans",
  "no_dues": "No dues",
  "dues": "Dues",
  "total_grants": "Total Grants",
  "no_active_grants": "No active grants",
  "approved_grants": "Approved Grants",
  "approved": "Approved"
};

const bnKeys = {
  "total_cash_balance": "মোট নগদ স্থিতি",
  "compared_to_last_month": "গত মাসের তুলনায়",
  "foundation_fund": "ফাউন্ডেশন তহবিল",
  "no_change": "গত মাসের তুলনায় কোনো পরিবর্তন নেই",
  "group_funds": "গ্রুপ তহবিল",
  "monthly_contributions": "মাসিক চাঁদা",
  "members": "সদস্য",
  "inactive_members": "নিষ্ক্রিয় সদস্য",
  "active": "সক্রিয়",
  "groups_beneficiaries": "গ্রুপ / উপকারভোগী",
  "active_institutions": "সক্রিয় প্রতিষ্ঠান",
  "total": "মোট",
  "active_loans": "সক্রিয় ঋণ",
  "no_dues": "কোনো বকেয়া নেই",
  "dues": "বকেয়া",
  "total_grants": "মোট অনুদান",
  "no_active_grants": "কোনো সক্রিয় অনুদান নেই",
  "approved_grants": "অনুমোদিত অনুদান",
  "approved": "অনুমোদিত"
};

function updateFile(file, newKeys) {
  const content = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(content);
  
  if (!data.dashboard) {
    data.dashboard = {};
  }
  
  Object.assign(data.dashboard, newKeys);
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

updateFile('src/i18n/locales/en.json', enKeys);
updateFile('src/i18n/locales/bn.json', bnKeys);
updateFile('src/i18n/locales/team-d/en.json', enKeys);
updateFile('src/i18n/locales/team-d/bn.json', bnKeys);
console.log('Added dashboard keys');
