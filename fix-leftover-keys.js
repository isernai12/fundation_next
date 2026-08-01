const fs = require('fs');

// Fix loan-profile-actions.tsx
let actionsCode = fs.readFileSync('src/features/loans/components/loan-profile-actions.tsx', 'utf8');

actionsCode = actionsCode.replace(/t\("loans\.k_8452eb"\)/g, 't("loans.table.actions.edit")');
actionsCode = actionsCode.replace(/t\("loans\.k_aabdef"\)/g, 't("loans.table.actions.repay")');
actionsCode = actionsCode.replace(/t\("loans\.k_694b10"\)/g, 't("loans.table.actions.ledger")');
actionsCode = actionsCode.replace(/t\("loans\.k_350e50"\)/g, 't("loans.table.actions.view")');
actionsCode = actionsCode.replace(/t\("loans\.k_a0b40f"\)/g, 't("common.print") || "Print"');

fs.writeFileSync('src/features/loans/components/loan-profile-actions.tsx', actionsCode);

// Fix loan-form.tsx leftovers
let formCode = fs.readFileSync('src/features/loans/components/loan-form.tsx', 'utf8');

formCode = formCode.replace(/t\("loans\.k_f96d37"\)/g, 't("loans.form.guarantorAddress")');
formCode = formCode.replace(/t\("loans\.k_c49823"\)/g, 't("loans.form.summary")');
formCode = formCode.replace(/<CardDescription>""<\/CardDescription>/g, '<CardDescription>{t("loans.form.summaryDesc")}</CardDescription>');

fs.writeFileSync('src/features/loans/components/loan-form.tsx', formCode);

console.log('Fixed leftover k_ strings');
