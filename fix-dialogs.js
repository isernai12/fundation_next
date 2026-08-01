const fs = require('fs');

let editContent = fs.readFileSync('src/features/contributions/components/edit-contribution-sheet.tsx', 'utf8');

editContent = editContent.replace(/toast\.success\(t\("contributions\.success_505a83"\), \{ description: "Contribution updated successfully" \}\)/g, 'toast.success(t("contributions.edit.success"))');
editContent = editContent.replace(/toast\.error\(t\("contributions\.error_902b0d"\), \{ description: result\.error \}\)/g, 'toast.error(result.error || t("contributions.form.errorMessage"))');
editContent = editContent.replace(/t\("contributions\.edit_contribution_bfb6c5"\)/g, 't("contributions.edit.title")');
editContent = editContent.replace(/t\("contributions\.update_the_contribut_157ded"\)/g, 't("contributions.edit.description")');

editContent = editContent.replace(/t\("contributions\.status_ec53a8"\)/g, 't("contributions.form.status")');
editContent = editContent.replace(/t\("contributions\.select_status_9aadb0"\)/g, 't("contributions.form.statusPlaceholder")');
editContent = editContent.replace(/\{status\}/g, '{status === "PAID" ? t("contributions.form.statuses.paid") : status === "PENDING" ? t("contributions.form.statuses.pending") : t("contributions.form.statuses.cancelled")}');

editContent = editContent.replace(/t\("contributions\.amount_31ee20"\)/g, 't("contributions.form.amount")');
editContent = editContent.replace(/t\("contributions\.payment_date_31738c"\)/g, 't("contributions.form.paymentDate")');

editContent = editContent.replace(/t\("contributions\.payment_method_707436"\)/g, 't("contributions.form.paymentMethod")');
editContent = editContent.replace(/t\("contributions\.select_payment_metho_7768d9"\)/g, 't("contributions.form.paymentMethodPlaceholder")');
editContent = editContent.replace(/t\("contributions\.cash_069b30"\)/g, 't("contributions.form.methods.cash")');
editContent = editContent.replace(/t\("contributions\.bkash_bb9796"\)/g, 't("contributions.form.methods.bkash")');
editContent = editContent.replace(/t\("contributions\.nagad_fea32f"\)/g, 't("contributions.form.methods.nagad")');
editContent = editContent.replace(/t\("contributions\.bank_transfer_3726d2"\)/g, 't("contributions.form.methods.bank")');

editContent = editContent.replace(/t\("contributions\.reference_number_opt_5157c0"\)/g, 't("contributions.form.reference")');
editContent = editContent.replace(/t\("contributions\.trxid_or_receipt_num_aafb14"\)/g, 't("contributions.form.referencePlaceholder")');

editContent = editContent.replace(/t\("contributions\.remarks_notes_58e223"\)/g, 't("contributions.form.notes")');
editContent = editContent.replace(/t\("contributions\.any_additional_notes_65a3f7"\)/g, 't("contributions.form.notesPlaceholder")');

editContent = editContent.replace(/t\("contributions\.cancel_ea4788"\)/g, 't("contributions.form.cancel")');
editContent = editContent.replace(/\{isSubmitting \? "Saving\.\.\." : "Save Changes"\}/g, '{isSubmitting ? t("contributions.form.saving") : t("contributions.form.save")}');

fs.writeFileSync('src/features/contributions/components/edit-contribution-sheet.tsx', editContent);

let viewContent = fs.readFileSync('src/features/contributions/components/view-contribution-dialog.tsx', 'utf8');
viewContent = viewContent.replace(/t\("contributions\.contribution_details_b342ab"\)/g, 't("contributions.view.title")');
viewContent = viewContent.replace(/t\("contributions\.detailed_information_102690"\)/g, 't("contributions.view.description")');
viewContent = viewContent.replace(/t\("contributions\.member_858ba4"\)/g, 't("contributions.view.member")');
viewContent = viewContent.replace(/t\("contributions\.group_039371"\)/g, 't("contributions.view.group")');
viewContent = viewContent.replace(/t\("contributions\.period_190160"\)/g, 't("contributions.view.period")');
viewContent = viewContent.replace(/t\("contributions\.type_a1fa27"\)/g, 't("contributions.view.type")');
viewContent = viewContent.replace(/contribution\.isAdditional \? "Additional Payment" : "Monthly Standard"/g, 'contribution.isAdditional ? t("contributions.view.types.additional") : t("contributions.view.types.standard")');
viewContent = viewContent.replace(/t\("contributions\.expected_amount_fda64d"\)/g, 't("contributions.view.expectedAmount")');
viewContent = viewContent.replace(/t\("contributions\.status_ec53a8"\)/g, 't("contributions.view.status")');
viewContent = viewContent.replace(/\{contribution\.status\}/g, '{contribution.status === "PAID" ? t("contributions.form.statuses.paid") : contribution.status === "PENDING" ? t("contributions.form.statuses.pending") : t("contributions.form.statuses.cancelled")}');

viewContent = viewContent.replace(/t\("contributions\.payment_amount_5bbe29"\)/g, 't("contributions.view.paymentAmount")');
viewContent = viewContent.replace(/t\("contributions\.payment_date_31738c"\)/g, 't("contributions.view.paymentDate")');
viewContent = viewContent.replace(/t\("contributions\.payment_method_707436"\)/g, 't("contributions.view.paymentMethod")');
viewContent = viewContent.replace(/\{payment\.paymentMethod\}/g, '{payment.paymentMethod === "CASH" ? t("contributions.form.methods.cash") : payment.paymentMethod === "BANK" ? t("contributions.form.methods.bank") : payment.paymentMethod === "BKASH" ? t("contributions.form.methods.bkash") : payment.paymentMethod === "NAGAD" ? t("contributions.form.methods.nagad") : t("contributions.form.methods.mobile")}');

viewContent = viewContent.replace(/t\("contributions\.reference_trxid_5ca831"\)/g, 't("contributions.view.reference")');
viewContent = viewContent.replace(/t\("contributions\.notes_remarks_4a7a61"\)/g, 't("contributions.view.notes")');
viewContent = viewContent.replace(/"No notes provided\."/g, 't("contributions.view.noNotes")');
viewContent = viewContent.replace(/payment\.notes \|\| t\("contributions\.view\.noNotes"\)/g, 'payment.notes || t("contributions.view.noNotes")');

viewContent = viewContent.replace(/t\("contributions\.ledger_transaction_i_141eb0"\)/g, 't("contributions.view.ledgerTransactionId")');
viewContent = viewContent.replace(/t\("contributions\.no_payments_recorded_b1d3c4"\)/g, 't("contributions.view.noPayments")');

fs.writeFileSync('src/features/contributions/components/view-contribution-dialog.tsx', viewContent);
console.log('Fixed dialogs');
