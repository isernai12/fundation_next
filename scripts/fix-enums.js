const fs = require('fs');

function fixBeneficiaries() {
  const p = 'src/features/beneficiaries/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { BeneficiaryStatus } from "@prisma/client"\n', '');
  c = c.replace(/status: \(pd\.status as BeneficiaryStatus\) \|\| BeneficiaryStatus\.ACTIVE/g, 'status: pd.status || "ACTIVE"');
  fs.writeFileSync(p, c);
}

function fixContributionsEdit() {
  const p = 'src/features/contributions/components/edit-contribution-sheet.tsx';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { ContributionStatus } from "@prisma/client"\n', '');
  c = c.replace(/Object\.values\(ContributionStatus\)/g, '["PENDING", "COMPLETED", "FAILED"]');
  fs.writeFileSync(p, c);
}

function fixContributionsSchema() {
  const p = 'src/features/contributions/schema.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { ContributionStatus } from "@prisma/client"\n', '');
  c = c.replace(/z\.nativeEnum\(ContributionStatus\)/g, 'z.enum(["PENDING", "COMPLETED", "FAILED"])');
  fs.writeFileSync(p, c);
}

function fixGroupsActions() {
  const p = 'src/features/groups/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { GroupStatus } from "@prisma/client"\n', '');
  c = c.replace(/GroupStatus\.INACTIVE/g, '"INACTIVE"');
  fs.writeFileSync(p, c);
}

function fixGroupsSchema() {
  const p = 'src/features/groups/schema.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { GroupStatus } from "@prisma/client"\n', '');
  c = c.replace(/z\.nativeEnum\(GroupStatus\)\.default\(GroupStatus\.ACTIVE\)/g, 'z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE")');
  fs.writeFileSync(p, c);
}

function fixLoansActions() {
  const p = 'src/features/loans/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { LoanStatus } from "@prisma/client"\n', '');
  fs.writeFileSync(p, c);
}

function fixMembersActions() {
  const p = 'src/features/members/actions.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('import { MemberStatus } from "@prisma/client"\n', '');
  c = c.replace(/newStatus: MemberStatus/g, 'newStatus: string');
  fs.writeFileSync(p, c);
}

function fixLedger() {
  const p = 'src/services/ledger.ts';
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace('import { LedgerType, Prisma } from "@prisma/client"', 'import { Prisma } from "@prisma/client"');
    c = c.replace(/type: LedgerType/g, 'type: string');
    fs.writeFileSync(p, c);
  }
}

fixBeneficiaries();
fixContributionsEdit();
fixContributionsSchema();
fixGroupsActions();
fixGroupsSchema();
fixLoansActions();
fixMembersActions();
fixLedger();
console.log("Fixed enums");
