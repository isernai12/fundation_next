const fs = require('fs');
let code = fs.readFileSync('src/features/loans/components/loan-ledger-table.tsx', 'utf8');

code = code.replace(/header: "Date"/g, 'header: t("loans.table.columns.date") || "Date"');
code = code.replace(/header: "Loan #"/g, 'header: t("loans.table.columns.loanNo") || "Loan #"');
code = code.replace(/header: "Beneficiary"/g, 'header: t("loans.table.columns.beneficiary") || "Beneficiary"');
code = code.replace(/header: "Type"/g, 'header: t("loans.table.columns.type") || "Type"');
code = code.replace(/header: "Notes"/g, 'header: t("loans.form.remarks") || "Notes"');
code = code.replace(/header: "Entries"/g, 'header: t("loans.table.actions.menu") || "Entries"');

code = code.replace(/t\("loans\.debit_disbursed_832e0a"\)/g, 't("loans.table.columns.debit")');
code = code.replace(/t\("loans\.credit_repaid_160c6f"\)/g, 't("loans.table.columns.credit")');
code = code.replace(/t\("loans\.balance_99a808"\)/g, 't("loans.table.columns.balance")');

code = code.replace(/t\("loans\.view_entries_e70b98"\)/g, 't("loans.table.actions.view")');
code = code.replace(/t\("loans\.fund_c1098d"\)/g, 't("loans.form.fundingSource")');
code = code.replace(/t\("loans\.debit_009534"\)/g, 't("loans.table.columns.debit")');
code = code.replace(/t\("loans\.credit_0a90b1"\)/g, 't("loans.table.columns.credit")');

code = code.replace(/t\("loans\.search_loan_benefici_debf43"\)/g, 't("loans.table.search")');
code = code.replace(/t\("loans\.print_ledger_f63e33"\)/g, 't("common.print") || "Print"');

code = code.replace(/t\("loans\.no_transactions_foun_808425"\)/g, 't("loans.table.empty")');
code = code.replace(/t\("loans\.previous_dd1f77"\)/g, 't("loans.table.pagination.previous")');
code = code.replace(/t\("loans\.next_10ac3d"\)/g, 't("loans.table.pagination.next")');

fs.writeFileSync('src/features/loans/components/loan-ledger-table.tsx', code);
console.log('Fixed loan-ledger-table.tsx');
