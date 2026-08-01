const fs = require('fs');
let content = fs.readFileSync('src/features/contributions/components/contributions-table.tsx', 'utf8');

content = content.replace(/t\("contributions\.deleted_5fe600"\)/g, 't("contributions.table.messages.deletedSuccess")');
content = content.replace(/toast\.error\(t\("contributions\.error_902b0d"\),/g, 'toast.error(t("contributions.form.errorMessage"),');
content = content.replace(/t\("contributions\.missing_details_75ebc6"\)/g, 't("contributions.table.messages.missingDetails")');
content = content.replace(/t\("contributions\.status_updated_858f68"\)/g, 't("contributions.table.messages.statusUpdated")');

content = content.replace(/header: "Member"/g, 'header: t("contributions.table.columns.member")');
content = content.replace(/header: "Group"/g, 'header: t("contributions.table.columns.group")');
content = content.replace(/header: "Period"/g, 'header: t("contributions.table.columns.period")');
content = content.replace(/header: "Amount"/g, 'header: t("contributions.table.columns.amount")');
content = content.replace(/header: "Status"/g, 'header: t("contributions.table.columns.status")');
content = content.replace(/header: "Type"/g, 'header: t("contributions.table.columns.type")');

content = content.replace(/\{row\.getValue\("status"\)\}/g, '{row.getValue("status") === "PAID" ? t("contributions.table.statuses.paid") : t("contributions.table.statuses.pending")}');

content = content.replace(/t\("contributions\.additional_27b948"\)/g, 't("contributions.table.types.additional")');
content = content.replace(/t\("contributions\.standard_eb6d8a"\)/g, 't("contributions.table.types.standard")');

content = content.replace(/t\("contributions\.open_menu_64d2cc"\)/g, 't("contributions.table.actions.menu")');
content = content.replace(/t\("contributions\.actions_06df33"\)/g, 't("contributions.table.actions.menu")');
content = content.replace(/t\("contributions\.view_details_5d5cd2"\)/g, 't("contributions.table.actions.view")');
content = content.replace(/t\("contributions\.edit_contribution_bfb6c5"\)/g, 't("contributions.table.actions.edit")');
content = content.replace(/t\("contributions\.mark_as_paid_cb5e3a"\)/g, 't("contributions.table.actions.markPaid")');
content = content.replace(/t\("contributions\.mark_as_pending_400d2b"\)/g, 't("contributions.table.actions.markPending")');
content = content.replace(/t\("contributions\.print_receipt_334d94"\)/g, 't("contributions.table.actions.printReceipt")');
content = content.replace(/t\("contributions\.download_pdf_260729"\)/g, 't("contributions.table.actions.downloadPdf")');
content = content.replace(/t\("contributions\.view_member_profile_5f663c"\)/g, 't("contributions.table.actions.viewMember")');

content = content.replace(/t\("contributions\.ledger_entry_0e2e6a"\)/g, 't("contributions.table.messages.ledgerFound")');
content = content.replace(/t\("contributions\.no_payment_4bc4e1"\)/g, 't("contributions.table.messages.ledgerNotFound")');
content = content.replace(/t\("contributions\.view_ledger_entry_b1b111"\)/g, 't("contributions.table.actions.viewLedger")');
content = content.replace(/t\("contributions\.delete_contribution_c726ce"\)/g, 't("contributions.table.actions.delete")');

content = content.replace(/t\("contributions\.filter_members_4805e8"\)/g, 't("contributions.table.filterPlaceholder")');
content = content.replace(/t\("contributions\.print_selected_cb4716"\)/g, 't("contributions.table.print")');
content = content.replace(/t\("contributions\.export_pdf_af8070"\)/g, 't("contributions.table.exportPdf")');

content = content.replace(/t\("contributions\.no_contributions_fou_eeb7f2"\)/g, 't("contributions.table.empty")');

content = content.replace(/t\("contributions\.row_s_selected_b5c5c5"\)/g, 't("contributions.table.pagination.selected")');
content = content.replace(/t\("contributions\.previous_dd1f77"\)/g, 't("contributions.table.pagination.previous")');
content = content.replace(/t\("contributions\.next_10ac3d"\)/g, 't("contributions.table.pagination.next")');

// Additional inline replacements
content = content.replace(/Are you sure you want to delete this contribution\? This will permanently remove the record and reverse all associated ledger entries\. This action cannot be undone\./g, 't("contributions.table.actions.deleteConfirm")');
content = content.replace(/if \(!confirm\(t\("contributions.table.actions.deleteConfirm"\)\)\) return;/g, 'if (!confirm(t("contributions.table.actions.deleteConfirm"))) return;');

fs.writeFileSync('src/features/contributions/components/contributions-table.tsx', content);
console.log('Fixed contributions-table.tsx');
