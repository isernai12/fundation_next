const fs = require('fs');
let code = fs.readFileSync('src/features/loans/components/receive-loan-payment-form.tsx', 'utf8');

code = code.replace(/t\("loans\.please_select_a_loan_3156a8"\)/g, 't("loans.repaymentForm.loanSelector")');
code = code.replace(/t\("loans\.payment_recorded_suc_ccd2ee"\)/g, 't("loans.repaymentForm.success")');
code = code.replace(/t\("loans\.loan_has_been_marked_5a37ad"\)/g, 't("loans.repaymentForm.success") + " (Completed)"');
code = code.replace(/t\("loans\.select_active_loan_79c81a"\)/g, 't("loans.repaymentForm.loanSelector")');
code = code.replace(/t\("loans\.search_by_loan_numbe_63862e"\)/g, '"Search by loan number or beneficiary"');
code = code.replace(/t\("loans\.search_loan_number_n_b40bff"\)/g, 't("loans.table.search")');
code = code.replace(/t\("loans\.no_active_loans_foun_c99fe7"\)/g, 't("loans.table.empty")');
code = code.replace(/t\("loans\.mobile_ffcb08"\)/g, '"Mobile: "');
code = code.replace(/t\("loans\.bal_843249"\)/g, '"Bal: ৳"');

code = code.replace(/t\("loans\.loan_summary_e6bfc9"\)/g, '"Loan Summary"');
code = code.replace(/t\("loans\.beneficiary_c7040c"\)/g, 't("loans.table.columns.beneficiary")');
code = code.replace(/t\("loans\.group_1aa4c6"\)/g, 't("loans.form.group")');
code = code.replace(/t\("loans\.loan_number_37b14d"\)/g, 't("loans.table.columns.loanNo")');
code = code.replace(/t\("loans\.loan_type_831b51"\)/g, 't("loans.table.columns.type")');
code = code.replace(/t\("loans\.disbursed_on_1f7595"\)/g, 't("loans.form.disbursementDate")');
code = code.replace(/t\("loans\.installment_plan_a4b991"\)/g, '"Installment Plan"');
code = code.replace(/t\("loans\.k_2bfbb4"\)/g, '"(৳"');
code = code.replace(/t\("loans\.loan_amount_6bb56a"\)/g, 't("loans.table.columns.amount")');
code = code.replace(/t\("loans\.total_paid_752d14"\)/g, '"Total Paid"');
code = code.replace(/t\("loans\.remaining_balance_d92896"\)/g, 't("loans.table.columns.balance")');
code = code.replace(/t\("loans\.next_due_date_c83f65"\)/g, 't("loans.form.firstInstallmentDate")');

code = code.replace(/t\("loans\.view_loan_ee0c35"\)/g, 't("loans.table.actions.view")');
code = code.replace(/t\("loans\.ledger_4dcb57"\)/g, 't("loans.table.actions.ledger")');

code = code.replace(/t\("loans\.receive_payment_01d35d"\)/g, 't("loans.table.actions.repay")');
code = code.replace(/t\("loans\.enter_the_details_fo_06345c"\)/g, '"Enter repayment details"');

code = code.replace(/t\("loans\.regular_installment_60c50f"\)/g, '"Regular"');
code = code.replace(/t\("loans\.partial_payment_921409"\)/g, '"Partial"');
code = code.replace(/t\("loans\.advance_payment_36f1f8"\)/g, '"Advance"');
code = code.replace(/t\("loans\.final_payment_f058f4"\)/g, '"Final"');

code = code.replace(/t\("loans\.payment_amount_45a304"\)/g, 't("loans.repaymentForm.amount")');
code = code.replace(/t\("loans\.payment_date_31738c"\)/g, 't("loans.repaymentForm.date")');
code = code.replace(/t\("loans\.pick_a_date_2badfa"\)/g, '"Pick a date"');
code = code.replace(/t\("loans\.payment_method_707436"\)/g, '"Payment Method"');
code = code.replace(/t\("loans\.select_a_payment_met_1f9bde"\)/g, '"Select Method"');
code = code.replace(/t\("loans\.cash_069b30"\)/g, '"Cash"');
code = code.replace(/t\("loans\.bank_transfer_3726d2"\)/g, '"Bank Transfer"');
code = code.replace(/t\("loans\.mobile_banking_bkash_dd7d00"\)/g, '"Mobile Banking"');

code = code.replace(/t\("loans\.reference_number_opt_5157c0"\)/g, 't("loans.repaymentForm.receipt")');
code = code.replace(/t\("loans\.e_g_trxid_or_cheque__321e92"\)/g, 't("loans.repaymentForm.receiptPlaceholder")');
code = code.replace(/t\("loans\.collector_name_optio_314fbe"\)/g, '"Collector Name (Optional)"');
code = code.replace(/t\("loans\.who_collected_this_p_c9959b"\)/g, '"Enter name"');
code = code.replace(/t\("loans\.receipt_upload_url_o_c66f4e"\)/g, '"Receipt Upload URL (Optional)"');
code = code.replace(/t\("loans\.optional_note_f66730"\)/g, 't("loans.repaymentForm.remarks")');
code = code.replace(/t\("loans\.any_additional_notes_a0197c"\)/g, 't("loans.form.remarksPlaceholder")');

code = code.replace(/t\("loans\.projected_remaining__ba3084"\)/g, '"Projected Remaining Balance"');
code = code.replace(/"Processing\.\.\." : "Receive Payment & Save"/, 'isSubmitting ? t("loans.repaymentForm.saving") : t("loans.repaymentForm.save")');


fs.writeFileSync('src/features/loans/components/receive-loan-payment-form.tsx', code);
