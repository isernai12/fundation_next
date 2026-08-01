const fs = require('fs');

// 1. new/page.tsx
let newPage = fs.readFileSync('src/app/loans/new/page.tsx', 'utf8');
newPage = newPage.replace(/<Trans tKey="app\.text" \/>/g, (match, offset) => {
  if (offset < 600) return '<Trans tKey="loans.new.pageTitle" />'; // The first one
  return '<Trans tKey="loans.new.subtitle" />'; // The second one
});
fs.writeFileSync('src/app/loans/new/page.tsx', newPage);

// 2. manage/page.tsx
let managePage = fs.readFileSync('src/app/loans/page.tsx', 'utf8');
managePage = managePage.replace(/<Trans tKey="app\.manage_loans" \/>/, '<Trans tKey="loans.manage.pageTitle" />');
managePage = managePage.replace(/<Trans tKey="app\.text" \/>/g, (match, offset) => {
  if (offset < 1500) return '<Trans tKey="loans.manage.subtitle" />';
  return '<Trans tKey="loans.manage.newBtn" />';
});
fs.writeFileSync('src/app/loans/page.tsx', managePage);

// 3. repayments/page.tsx
let repayPage = fs.readFileSync('src/app/loans/repayments/page.tsx', 'utf8');
repayPage = repayPage.replace(/<Trans tKey="app\.receive_loan_payment" \/>/, '<Trans tKey="loans.repay.pageTitle" />');
repayPage = repayPage.replace(/Select a loan to view details and securely record a new repayment\./, '<Trans tKey="loans.repay.subtitle" />');
fs.writeFileSync('src/app/loans/repayments/page.tsx', repayPage);

// 4. ledger/page.tsx
let ledgerPage = fs.readFileSync('src/app/loans/ledger/page.tsx', 'utf8');
ledgerPage = ledgerPage.replace(
  /<h1 className="text-2xl font-bold tracking-tight">Loan Ledger \{specificLoan \? `\- \$\{specificLoan\.loanNumber\}` : ""\}<\/h1>/,
  '<h1 className="text-2xl font-bold tracking-tight">{specificLoan ? `${t("loans.ledger.pageTitle")} - ${specificLoan.loanNumber}` : t("loans.ledger.pageTitle")}</h1>'
);
ledgerPage = ledgerPage.replace(
  /\{specificLoan\s*\?\s*`Ledger for \$\{specificLoan\.beneficiary\?\.fullName\}\. Total Loan: ৳\$\{specificLoan\.amount\}, Remaining: ৳\$\{specificLoan\.remainingBalance\}`\s*:\s*"View all loan disbursement and repayment ledger transactions\."\}/,
  '{specificLoan ? t("loans.ledger.subtitleSpecific").replace("{name}", specificLoan.beneficiary?.fullName || "").replace("{amount}", specificLoan.amount).replace("{remaining}", specificLoan.remainingBalance) : t("loans.ledger.subtitle")}'
);

if (ledgerPage.indexOf('useLanguage') === -1) {
  ledgerPage = ledgerPage.replace(/export default async function LoanLedgerPage/, `import { getTranslations } from "@/i18n/LanguageProvider"\n\nexport default async function LoanLedgerPage`);
  ledgerPage = ledgerPage.replace(/const \{ loanId \} = searchParams/, `const { loanId } = searchParams\n  const { t } = await getTranslations()`);
}
fs.writeFileSync('src/app/loans/ledger/page.tsx', ledgerPage);

console.log('Pages updated');
