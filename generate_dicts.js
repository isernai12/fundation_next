const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const bn = JSON.parse(fs.readFileSync('src/i18n/locales/bn.json', 'utf8'));

function createDictionaryFiles(lang, data) {
  const layoutKeys = [
    'main_menu', 'dashboard', 'members', 'new_member', 'manage_members', 'member_ledger', 'due_dues',
    'beneficiaries', 'new_beneficiary', 'manage_beneficiaries', 'beneficiary_ledger', 'assistance_history', 'loan_history',
    'donors', 'new_donor', 'manage_donors', 'receive_donation', 'donor_ledger', 'financial_activities',
    'new_fund', 'manage_funds', 'receive_fund_contribution', 'fund_ledger', 'fund_dues', 'receive_fund',
    'monthly_dues', 'manage_dues', 'dues_ledger', 'loans', 'new_loan', 'manage_loans', 'repay_loan', 'loan_ledger',
    'grants', 'new_grant', 'manage_grants', 'organization', 'groups', 'new_group', 'manage_groups', 'group_members',
    'group_fund', 'group_ledger', 'settings', 'logo_8c2857', 'user_8f9bfe'
  ];

  const commonKeys = [
    'dashboard', 'profile', 'settings', 'logout', 'save', 'cancel', 'edit', 'delete'
  ];

  const dashboardKeys = [
    'overview', 'total_members', 'active_members', 'inactive_members', 'monthly_collection', 'this_month', 
    'total_fund', 'current_balance', 'active_loans', 'outstanding_amount', 'recent_transactions', 'view_all',
    'quick_actions', 'add_member', 'collect_dues', 'issue_loan', 'record_expense', 'system_alerts', 'no_alerts_at_this_time',
    'member_registration', 'amount_in_f7e3e7', 'k_f54ce0', 'k_568d0e', 'k_63998c'
  ];

  const headerKeys = [
    'theme', 'help_center', 'device_management', 'change_password'
  ];

  const layout = { sidebar: {}, header: {} };
  const common = {};
  const dashboard = {};

  layoutKeys.forEach(k => {
    // try to find it in data.layout, data, data.sidebar, etc.
    const val = data.layout?.[k] || data.sidebar?.[k] || data[k] || k.replace(/_/g, ' ');
    layout.sidebar[k] = val;
  });

  headerKeys.forEach(k => {
    const val = data.header?.[k] || data[k] || k.replace(/_/g, ' ');
    layout.header[k] = val;
  });

  commonKeys.forEach(k => {
    const val = data.common?.[k] || data[k] || k.replace(/_/g, ' ');
    common[k] = val;
  });

  dashboardKeys.forEach(k => {
    const val = data.dashboard?.[k] || data[k] || k.replace(/_/g, ' ');
    dashboard[k] = val;
  });

  fs.writeFileSync(`src/i18n/dictionaries/${lang}/layout.json`, JSON.stringify(layout, null, 2));
  fs.writeFileSync(`src/i18n/dictionaries/${lang}/common.json`, JSON.stringify(common, null, 2));
  fs.writeFileSync(`src/i18n/dictionaries/${lang}/dashboard.json`, JSON.stringify(dashboard, null, 2));
}

createDictionaryFiles('en', en);
createDictionaryFiles('bn', bn);

console.log("Dictionaries generated.");
