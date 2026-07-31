const fs = require('fs');

const mappings = {
  "ledger_4dcb57": ["actions.ledger", "Ledger", "লেজার"],
  "collect_e7ca85": ["actions.collect", "Collect", "সংগ্রহ করুন"],
  "search_by_name_id_or_684ecd": ["table.search_dues", "Search by member name or ID", "সদস্যের নাম বা আইডি দিয়ে খুঁজুন"],
  "filter_by_group_0c1a2e": ["table.filter_group", "Filter by group", "গ্রুপ দিয়ে ফিল্টার করুন"],
  "all_statuses_a775fc": ["table.all_statuses", "All Statuses", "সকল অবস্থা"],
  "paid_e0010a": ["status.paid", "Paid", "পরিশোধিত"],
  "due_d03639": ["status.due", "Due", "বকেয়া"],
  "advance_0a86dd": ["status.advance", "Advance", "অগ্রিম"],
  "previous_dd1f77": ["table.previous", "Previous", "পূর্ববর্তী"],
  "next_10ac3d": ["table.next", "Next", "পরবর্তী"],
  "due_status_340b09": ["table.due_status", "Due Status", "বকেয়ার অবস্থা"],
  "join_month_362bdb": ["table.join_month", "Join Month", "যোগদানের মাস"],
  "all_months_abba00": ["table.all_months", "All Months", "সকল মাস"],
  "january_86f597": ["months.jan", "January", "জানুয়ারি"],
  "february_659e59": ["months.feb", "February", "ফেব্রুয়ারি"],
  "march_fa3e5e": ["months.mar", "March", "মার্চ"],
  "april_3fcf02": ["months.apr", "April", "এপ্রিল"],
  "may_195fbb": ["months.may", "May", "মে"],
  "june_688937": ["months.jun", "June", "জুন"],
  "july_1b539f": ["months.jul", "July", "জুলাই"],
  "august_41ba70": ["months.aug", "August", "আগস্ট"],
  "september_cc5d90": ["months.sep", "September", "সেপ্টেম্বর"],
  "october_eca60a": ["months.oct", "October", "অক্টোবর"],
  "november_7e823b": ["months.nov", "November", "নভেম্বর"],
  "december_823315": ["months.dec", "December", "ডিসেম্বর"],
  "no_results_3b8769": ["table.no_results", "No results found.", "কোন ফলাফল পাওয়া যায়নি।"]
};

// 1. Fix member-dues-table.tsx
let duesTable = fs.readFileSync('src/features/members/components/member-dues-table.tsx', 'utf8');
for (const [oldKey, val] of Object.entries(mappings)) {
  duesTable = duesTable.replace(new RegExp(`"members\\.${oldKey}"`, 'g'), `"members.${val[0]}"`);
}
// Fix hardcoded table headers!
duesTable = duesTable.replace(/"Member Name"/g, 't("members.table.member_name")');
duesTable = duesTable.replace(/"Group"/g, 't("members.table.group")');
duesTable = duesTable.replace(/"Join Date"/g, 't("members.table.join_date")');
duesTable = duesTable.replace(/"Monthly Contribution"/g, 't("members.table.monthly_contribution")');
duesTable = duesTable.replace(/"Expected"/g, 't("members.table.expected")');
duesTable = duesTable.replace(/"Paid"/g, 't("members.table.paid")');
duesTable = duesTable.replace(/"Advance"/g, 't("members.table.advance")');
duesTable = duesTable.replace(/"Due"/g, 't("members.table.due")');
duesTable = duesTable.replace(/"Status"/g, 't("members.table.status")');
duesTable = duesTable.replace(/"Last Payment"/g, 't("members.table.last_payment")');

fs.writeFileSync('src/features/members/components/member-dues-table.tsx', duesTable);

// 2. Fix app/members/dues/page.tsx
let duesPage = fs.readFileSync('src/app/members/dues/page.tsx', 'utf8');
// Fix the page title
duesPage = duesPage.replace(/<Trans tKey="app\.text" \/>/, '<Trans tKey="members.dues_page.title" />');
// Fix the cards
let cardReplaces = [
  '<Trans tKey="members.dues_page.total_members" />',
  '<Trans tKey="members.dues_page.members_in_due" />',
  '<Trans tKey="members.dues_page.total_outstanding" />',
  '<Trans tKey="members.dues_page.total_advance" />',
  '<Trans tKey="members.dues_page.collected_this_month" />'
];
let cardIndex = 0;
duesPage = duesPage.replace(/<Trans tKey="app\.text" \/>/g, (match) => {
  return cardReplaces[cardIndex++] || match;
});
fs.writeFileSync('src/app/members/dues/page.tsx', duesPage);

// 3. Update dictionaries
const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/members.json'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/members.json'));

for (const [oldKey, val] of Object.entries(mappings)) {
  const [newKey, enVal, bnVal] = val;
  const parts = newKey.split('.');
  
  let currEn = en;
  let currBn = bn;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!currEn[parts[i]]) currEn[parts[i]] = {};
    if (!currBn[parts[i]]) currBn[parts[i]] = {};
    currEn = currEn[parts[i]];
    currBn = currBn[parts[i]];
  }
  
  currEn[parts[parts.length - 1]] = enVal;
  currBn[parts[parts.length - 1]] = bnVal;
}

// Add table headers
en.table.member_name = "Member Name";
bn.table.member_name = "সদস্যের নাম";
en.table.monthly_contribution = "Monthly Contribution";
bn.table.monthly_contribution = "মাসিক চাঁদা";
en.table.expected = "Expected";
bn.table.expected = "প্রত্যাশিত";
en.table.paid = "Paid";
bn.table.paid = "পরিশোধিত";
en.table.advance = "Advance";
bn.table.advance = "অগ্রিম";
en.table.due = "Due";
bn.table.due = "বকেয়া";
en.table.last_payment = "Last Payment";
bn.table.last_payment = "সর্বশেষ পেমেন্ট";

// Add Dues Page specific keys
en.dues_page = {
  title: "Member Dues",
  total_members: "Total Members",
  members_in_due: "Members in Due",
  total_outstanding: "Total Outstanding Due",
  total_advance: "Total Advance Balance",
  collected_this_month: "Collected This Month"
};
bn.dues_page = {
  title: "সদস্যদের বকেয়া",
  total_members: "মোট সদস্য",
  members_in_due: "বকেয়া থাকা সদস্য",
  total_outstanding: "মোট বকেয়া",
  total_advance: "মোট অগ্রিম ব্যালেন্স",
  collected_this_month: "এই মাসে সংগৃহীত"
};

fs.writeFileSync('src/i18n/dictionaries/en/members.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/members.json', JSON.stringify(bn, null, 2));

