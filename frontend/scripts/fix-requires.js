const fs = require('fs');

function fixDashboard() {
  const p = 'src/features/dashboard/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('const { FinancialService } = require("@/services/finance")', '');
  c = `import { FinancialService } from "@/services/finance"\n` + c;
  fs.writeFileSync(p, c);
}

function fixDonors() {
  const p = 'src/features/donors/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/const \{ LedgerEngine \} = require\("@\/services\/ledger"\)/g, '');
  c = `import { LedgerEngine } from "@/services/ledger"\n` + c;
  fs.writeFileSync(p, c);
}

function fixGroups() {
  const p = 'src/features/groups/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/const \{ FinancialService \} = require\("@\/services\/finance"\)/g, '');
  c = `import { FinancialService } from "@/services/finance"\n` + c;
  fs.writeFileSync(p, c);
}

fixDashboard();
fixDonors();
fixGroups();
console.log("Fixed requires");
