const fs = require('fs');
let content = fs.readFileSync('src/features/contributions/components/contribution-form.tsx', 'utf8');

content = content.replace(/const bengaliMonths = \[\n\s+"জানুয়ারি".*\n.*\];/g, '');

content = content.replace(/toast\.success\(t\("contributions\.k_469c39"\)\)/g, 'toast.success(t("contributions.form.successMessage"))');
content = content.replace(/toast\.error\(res\.error \|\| "সংরক্ষণ করতে ব্যর্থ হয়েছে"\)/g, 'toast.error(res.error || t("contributions.form.errorMessage"))');

content = content.replace(/<Card className="max-w-5xl mx-auto shadow-sm border mt-4">/g, '<Card className="mb-6 shadow-sm border-muted max-w-5xl mx-auto">');
content = content.replace(/<CardHeader className="border-b mb-6 pb-4">/g, '<CardHeader className="py-4 border-b bg-muted/10">');
content = content.replace(/<CardTitle className="text-xl font-bold">\{t\("contributions\.k_f0d1bb"\)\}<\/CardTitle>/g, '<CardTitle className="text-lg font-semibold">{t("contributions.form.title")}</CardTitle>');
content = content.replace(/<CardDescription>\{t\("contributions\.k_f54ce0"\)\}<\/CardDescription>/g, '<CardDescription>{t("contributions.form.description")}</CardDescription>');

content = content.replace(/\{t\("contributions\.k_868b90"\)\}/g, '{t("contributions.form.member")}');
content = content.replace(/\{t\("contributions\.k_568d0e"\)\}/g, '{t("contributions.form.month")}');
content = content.replace(/\{t\("contributions\.k_1e1467"\)\}/g, '{t("contributions.form.monthPlaceholder")}');
content = content.replace(/\{bengaliMonths\[m - 1\]\}/g, '{(() => { const arr = t("contributions.months"); return Array.isArray(arr) ? arr[m - 1] : t(`contributions.months.${m - 1}`); })()}');

content = content.replace(/\{t\("contributions\.k_4083b2"\)\}/g, '{t("contributions.form.year")}');
content = content.replace(/\{t\("contributions\.k_63998c"\)\}/g, '{t("contributions.form.amount")}');
content = content.replace(/\{t\("contributions\.k_d6954c"\)\}/g, '{t("contributions.form.paymentDate")}');

content = content.replace(/\{t\("contributions\.k_ab3ed0"\)\}/g, '{t("contributions.form.paymentMethod")}');
content = content.replace(/\{t\("contributions\.k_353488"\)\}/g, '{t("contributions.form.paymentMethodPlaceholder")}');
content = content.replace(/\{t\("contributions\.k_b43e1f"\)\}/g, '{t("contributions.form.methods.cash")}');
content = content.replace(/\{t\("contributions\.k_c6edc5"\)\}/g, '{t("contributions.form.methods.bank")}');
content = content.replace(/\{t\("contributions\.k_09e92d"\)\}/g, '{t("contributions.form.methods.mobile")}');

content = content.replace(/\{t\("contributions\.k_c2d029"\)\}/g, '{t("contributions.form.reference")}');
content = content.replace(/\{t\("contributions\.k_ff596f"\)\}/g, '{t("contributions.form.referencePlaceholder")}');

content = content.replace(/\{t\("contributions\.k_8dd4e8"\)\}/g, '{t("contributions.form.status")}');
content = content.replace(/\{t\("contributions\.k_ab7f1a"\)\}/g, '{t("contributions.form.statusPlaceholder")}');
content = content.replace(/\{t\("contributions\.k_2c893a"\)\}/g, '{t("contributions.form.statuses.paid")}');
content = content.replace(/\{t\("contributions\.k_277e03"\)\}/g, '{t("contributions.form.statuses.pending")}');

content = content.replace(/\{t\("contributions\.k_550c03"\)\}/g, '{t("contributions.form.notes")}');
content = content.replace(/\{t\("contributions\.k_b5321c"\)\}/g, '{t("contributions.form.notesPlaceholder")}');

content = content.replace(/\{t\("contributions\.k_f3a483"\)\}/g, '{t("contributions.form.isAdditional")}');
content = content.replace(/\{t\("contributions\.k_35750c"\)\}/g, '{t("contributions.form.isAdditionalDescription")}');

content = content.replace(/\{t\("contributions\.k_de9b04"\)\}/g, '{t("contributions.form.cancel")}');
content = content.replace(/\{loading \? "সংরক্ষণ করা হচ্ছে\.\.\." : "সংরক্ষণ করুন"\}/g, '{loading ? t("contributions.form.saving") : t("contributions.form.save")}');

fs.writeFileSync('src/features/contributions/components/contribution-form.tsx', content);
console.log('Fixed contribution-form.tsx');
