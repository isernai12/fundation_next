const fs = require('fs');
let code = fs.readFileSync('src/features/loans/components/loans-table.tsx', 'utf8');

// Replace hardcoded Bengali headers
code = code.replace(/"সুবিধাভোগীর নাম"/g, 't("loans.table.columns.beneficiary")');
code = code.replace(/"মোবাইল নম্বর"/g, 't("common.phone") || "Phone"');
code = code.replace(/"ঋণের পরিমাণ"/g, 't("loans.table.columns.amount")');
code = code.replace(/"বাকি ঋণ"/g, 't("loans.table.columns.balance")');
code = code.replace(/"পরবর্তী কিস্তি"/g, 't("loans.table.columns.nextDue") || "Next Due"');
code = code.replace(/"বকেয়া অবস্থা"/g, 't("loans.table.columns.due")');
code = code.replace(/"অবস্থা"/g, 't("loans.table.columns.status")');

// Replace known translation keys
code = code.replace(/t\("loans\.k_3734da"\)/g, 't("loans.table.columns.loanNo")');
code = code.replace(/t\("loans\.open_menu_64d2cc"\)/g, 't("loans.table.actions.menu")');
code = code.replace(/t\("loans\.k_7c6fd8"\)/g, 't("loans.table.actions.menu")');
code = code.replace(/t\("loans\.k_f61612"\)/g, 't("loans.table.actions.view")');
code = code.replace(/t\("loans\.k_603499"\)/g, 't("loans.table.actions.edit")');
code = code.replace(/t\("loans\.k_e0d142"\)/g, 't("loans.table.actions.repay")');
code = code.replace(/t\("loans\.k_9dd61c"\)/g, 't("loans.table.actions.ledger")');
code = code.replace(/t\("loans\.k_0d64cd"\)/g, 't("loans.table.actions.ledger")'); // book open icon
code = code.replace(/t\("loans\.k_d26d50"\)/g, 't("common.print") || "Print"');
code = code.replace(/t\("loans\.delete_c25b14"\)/g, 't("loans.table.actions.delete")');

code = code.replace(/t\("loans\.total_loans_b3ec0f"\)/g, 't("loans.manage.totalLoans") || "Total Loans"');
code = code.replace(/t\("loans\.active_loans_da1427"\)/g, 't("loans.manage.activeLoans") || "Active Loans"');
code = code.replace(/t\("loans\.completed_07ca50"\)/g, 't("loans.manage.completedLoans") || "Completed"');
code = code.replace(/t\("loans\.due_today_b523c0"\)/g, 't("loans.table.dueStatus.dueToday")');
code = code.replace(/t\("loans\.overdue_loans_583472"\)/g, 't("loans.manage.overdueLoans") || "Overdue Loans"');
code = code.replace(/t\("loans\.total_outstanding_f85ec2"\)/g, 't("loans.manage.totalOutstanding") || "Total Outstanding"');
code = code.replace(/t\("loans\.total_recovered_3e8934"\)/g, 't("loans.manage.totalRecovered") || "Total Recovered"');

code = code.replace(/t\("loans\.filter_loans_217f5e"\)/g, 't("loans.manage.filterLoans") || "Filter Loans"');
code = code.replace(/t\("loans\.search_id_name_mobil_04a67c"\)/g, 't("loans.table.search")');
code = code.replace(/t\("loans\.loan_type_7a49ec"\)/g, 't("loans.table.columns.type")');
code = code.replace(/t\("loans\.all_types_90b2f7"\)/g, 't("loans.form.types.all") || "All Types"');
code = code.replace(/t\("loans\.business_d6e6cb"\)/g, 't("loans.form.purposes.business")');
code = code.replace(/t\("loans\.other_6311ae"\)/g, 't("loans.form.purposes.other")');

code = code.replace(/t\("loans\.loan_status_e103d2"\)/g, 't("loans.table.columns.status")');
code = code.replace(/t\("loans\.all_status_162647"\)/g, 't("loans.form.types.all") || "All Status"');
code = code.replace(/t\("loans\.active_4d3d76"\)/g, 't("loans.table.status.active")');
code = code.replace(/t\("loans\.overdue_3f165a"\)/g, 't("loans.table.status.overdue") || "Overdue"');

code = code.replace(/t\("loans\.due_status_340b09"\)/g, 't("loans.table.columns.due")');
code = code.replace(/t\("loans\.all_due_status_36f1ba"\)/g, 't("loans.form.types.all") || "All Due Status"');
code = code.replace(/t\("loans\.upcoming_due_b62269"\)/g, 't("loans.table.dueStatus.upcomingDue")');
code = code.replace(/t\("loans\.no_due_f49d1e"\)/g, 't("loans.table.dueStatus.noDue")');

code = code.replace(/t\("loans\.min_ffa65f"\)/g, 't("common.min") || "Min"');
code = code.replace(/t\("loans\.max_221241"\)/g, 't("common.max") || "Max"');

code = code.replace(/t\("loans\.no_loans_found_2b0ba6"\)/g, 't("loans.table.empty")');
code = code.replace(/t\("loans\.k_8347d9"\)/g, 't("loans.table.pagination.previous")');
code = code.replace(/t\("loans\.k_30ffb9"\)/g, 't("loans.table.pagination.next")');

code = code.replace(/t\("loans\.k_748d38"\)/g, 't("loans.manage.deleteErrorHasRepayments") || "Cannot delete loan with existing repayments."');
code = code.replace(/"আপনি কি নিশ্চিত যে আপনি এই ঋণ মুছে ফেলতে চান\?"/g, 't("loans.manage.deleteConfirm") || "Are you sure you want to delete this loan?"');
code = code.replace(/t\("loans\.k_122b75"\)/g, 't("loans.manage.deleteSuccess") || "Loan deleted successfully."');
code = code.replace(/t\("loans\.coming_soon_mark_as__32cbfb"\)/g, 't("loans.manage.comingSoon") || "Coming soon!"');

fs.writeFileSync('src/features/loans/components/loans-table.tsx', code);
