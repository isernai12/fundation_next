const fs = require('fs');

let code = fs.readFileSync('src/features/loans/components/due-list-table.tsx', 'utf8');

code = code.replace(/header: "Loan #"/g, 'header: t("loans.table.columns.loanNo") || "Loan #"');
code = code.replace(/header: "Beneficiary"/g, 'header: t("loans.table.columns.beneficiary") || "Beneficiary"');
code = code.replace(/header: "Mobile"/g, 'header: t("common.phone") || "Mobile"');
code = code.replace(/header: "Group"/g, 'header: t("loans.form.group") || "Group"');
code = code.replace(/header: "Inst\. Type"/g, 'header: t("loans.form.installmentType") || "Inst. Type"');
code = code.replace(/header: "Next Due Date"/g, 'header: t("loans.form.firstInstallmentDate") || "Next Due Date"');
code = code.replace(/header: "Remaining Balance"/g, 'header: t("loans.table.columns.balance") || "Remaining Balance"');
code = code.replace(/header: "Status"/g, 'header: t("loans.table.columns.status") || "Status"');

code = code.replace(/t\("loans\.filter_dues_8ca8a1"\)/g, '"Filter Dues"');
code = code.replace(/t\("loans\.print_list_f85417"\)/g, 't("common.print") || "Print"');
code = code.replace(/t\("loans\.search_id_name_mobil_04a67c"\)/g, 't("loans.table.search")');
code = code.replace(/t\("loans\.due_status_340b09"\)/g, 't("loans.table.columns.due")');

code = code.replace(/t\("loans\.all_dues_aabcf2"\)/g, '"All Dues"');
code = code.replace(/t\("loans\.due_today_b523c0"\)/g, 't("loans.table.dueStatus.dueToday")');
code = code.replace(/t\("loans\.upcoming_due_b62269"\)/g, 't("loans.table.dueStatus.upcomingDue")');
code = code.replace(/t\("loans\.overdue_3f165a"\)/g, 't("loans.table.dueStatus.overdue")');

code = code.replace(/t\("loans\.no_due_loans_found_e2ffda"\)/g, 't("loans.table.empty")');
code = code.replace(/t\("loans\.previous_dd1f77"\)/g, 't("loans.table.pagination.previous")');
code = code.replace(/t\("loans\.next_10ac3d"\)/g, 't("loans.table.pagination.next")');

fs.writeFileSync('src/features/loans/components/due-list-table.tsx', code);
