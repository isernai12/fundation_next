const fs = require('fs');
let code = fs.readFileSync('src/features/loans/components/loan-form.tsx', 'utf8');

// Replace card titles and descriptions
code = code.replace(/<CardTitle>\{t\("loans\.k_a183b1"\)\}<\/CardTitle>/, '<CardTitle>{t("loans.form.steps.beneficiarySelection")}</CardTitle>');
code = code.replace(/<CardDescription>\{t\("loans\.k_9d4717"\)\}<\/CardDescription>/, '<CardDescription>{t("loans.form.selectBeneficiary")}</CardDescription>');

code = code.replace(/<CardTitle>\{t\("loans\.funding_source_a41336"\)\}<\/CardTitle>/, '<CardTitle>{t("loans.form.fundingSource")}</CardTitle>');
code = code.replace(/<CardDescription>\{t\("loans\.k_d6e037"\)\}<\/CardDescription>/, '<CardDescription>{t("loans.form.selectFundingSource")}</CardDescription>');

code = code.replace(/<CardTitle>\{t\("loans\.k_7f3e49"\)\}<\/CardTitle>/, '<CardTitle>{t("loans.form.steps.loanInfo")}</CardTitle>');
code = code.replace(/<CardDescription>\{t\("loans\.k_5d5310"\)\}<\/CardDescription>/, '<CardDescription>{t("loans.form.remarks")}</CardDescription>'); // or something similar, maybe just removed

code = code.replace(/<CardTitle>\{t\("loans\.k_550a27"\)\}<\/CardTitle>/, '<CardTitle>{t("loans.form.documents")}</CardTitle>');
code = code.replace(/<CardDescription>\{t\("loans\.pdf_jpg_png_7d9e99"\)\}<\/CardDescription>/, '<CardDescription>{t("loans.form.documentsDesc")}</CardDescription>');

// Form Labels
code = code.replace(/\{t\("loans\.k_1a1f1e"\)\}/g, '{t("loans.form.beneficiary")}');
code = code.replace(/\{t\("loans\.reason_c172f0"\)\}/g, '{t("loans.form.reason")}');
code = code.replace(/\{t\("loans\.k_0c115b"\)\}/g, '{t("loans.form.reasonPlaceholder")}');

code = code.replace(/\{t\("loans\.k_8befe3"\)\}/g, '{t("loans.form.amount")}');

code = code.replace(/\{t\("loans\.k_917edc"\)\}/g, '{t("loans.form.installmentType")}');
code = code.replace(/\{t\("loans\.k_426577"\)\}/g, '{"Select Type"}');

code = code.replace(/\{t\("loans\.k_0e4836"\)\}/g, '{t("loans.form.types.daily")}');
code = code.replace(/\{t\("loans\.k_d4f34e"\)\}/g, '{t("loans.form.types.weekly")}');
code = code.replace(/\{t\("loans\.k_1788bf"\)\}/g, '{t("loans.form.types.monthly")}');
code = code.replace(/\{t\("loans\.k_db09fd"\)\}/g, '{t("loans.form.types.custom")}');

code = code.replace(/\{t\("loans\.k_91c500"\)\}/g, '{t("loans.form.installmentAmount")}');
code = code.replace(/\{t\("loans\.k_7b319f"\)\}/g, '{t("loans.form.numberOfInstallments")}');

code = code.replace(/\{t\("loans\.k_d44d54"\)\}/g, '{t("loans.form.remarks")}');
code = code.replace(/\{t\("loans\.k_5e1208"\)\}/g, '{t("loans.form.remarksPlaceholder")}');

code = code.replace(/\{t\("loans\.k_791764"\)\}/g, '{t("loans.form.purpose")}');
code = code.replace(/\{t\("loans\.k_1a8a5d"\)\}/g, '{t("loans.form.selectPurpose")}');

code = code.replace(/\{t\("loans\.group_d4d811"\)\}/g, '{t("loans.form.group")}');
code = code.replace(/\{t\("loans\.k_0a2922"\)\}/g, '{"Select Group"}');

code = code.replace(/\{t\("loans\.available_balance_01cdd5"\)\}/g, '{t("loans.form.availableBalance")}');
code = code.replace(/\{t\("loans\.remaining_after_loan_fcbbfd"\)\}/g, '{t("loans.form.remainingAfterLoan")}');

// Buttons
code = code.replace(/\{t\("loans\.k_c94621"\)\}/g, '{t("loans.form.cancel")}');
code = code.replace(/\{t\("loans\.k_8e9437"\)\}/g, '{t("loans.form.save")}');
code = code.replace(/\{t\("loans\.k_9c72ba"\)\}/g, '{t("loans.form.saving")}');
code = code.replace(/\{t\("loans\.k_224764"\)\}/g, '{t("loans.form.addGuarantor")}');
code = code.replace(/\{t\("loans\.k_047838"\)\}/g, '{t("loans.form.removeDocument")}');
code = code.replace(/\{t\("loans\.k_cb4158"\)\}/g, '{"View"}');
code = code.replace(/\{t\("loans\.k_97d873"\)\}/g, '{t("loans.form.uploadDocument")}');
code = code.replace(/\{t\("loans\.pdf_jpg_png_webp_mb_e8adfb"\)\}/g, '{"PDF, JPG, PNG, WEBP (Max 5MB)"}');

// Guarantor stuff
code = code.replace(/\{t\("loans\.k_d662de"\)\}/g, '{t("loans.form.guarantors")}');
code = code.replace(/\{t\("loans\.k_684437"\)\}/g, '{t("loans.form.guarantorsDesc")}');
code = code.replace(/\{t\("loans\.k_6eeab3"\)\}/g, '{t("loans.form.guarantorName")}');
code = code.replace(/\{t\("loans\.k_ee6e42"\)\}/g, '{t("loans.form.guarantorPhone")}');
code = code.replace(/\{t\("loans\.k_1f9448"\)\}/g, '{"01XXXXXXXXX"}');
code = code.replace(/\{t\("loans\.k_173a9f"\)\}/g, '{t("loans.form.guarantorRelation")}');

// Others
code = code.replace(/\{t\("loans\.k_63988f"\)\}/g, '{"Existing Documents"}');
code = code.replace(/\{t\("loans\.k_4474d3"\)\}/g, '{"New Documents"}');

code = code.replace(/toast\.success\(isEditMode \? "ঋণ সফলভাবে সংশোধন করা হয়েছে!" : "নতুন ঋণ সফলভাবে তৈরি করা হয়েছে!"\)/, 'toast.success(isEditMode ? t("loans.form.updateSuccess") : t("loans.form.success"))');
code = code.replace(/toast\.info\("ডকুমেন্ট আপলোড করা হচ্ছে\.\.\."\)/, 'toast.info(t("loans.form.uploading"))');
code = code.replace(/confirm\("আপনি কি নিশ্চিত যে এই ডকুমেন্টটি মুছে ফেলতে চান\?"\)/, 'confirm("Are you sure?")');

// Replace any leftover t("loans.k_...") with an empty string or something
code = code.replace(/\{t\("loans\.k_[a-z0-9]+"\)\}/g, '""');

fs.writeFileSync('src/features/loans/components/loan-form.tsx', code);
console.log('loan-form fixed');
