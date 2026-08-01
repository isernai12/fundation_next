const fs = require('fs');
let code = fs.readFileSync('src/features/loans/components/loan-form.tsx', 'utf8');

// Replace the loanType and purpose fields with a unified purpose RadioGroup
const replacement = `
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => {
                const isOther = !["Business", "Medical", "Education", "Agriculture", "Emergency", "House Repair", "Marriage", "Small Business"].includes(field.value) && field.value !== "";
                const displayValue = isOther ? "Other" : field.value;

                return (
                  <FormItem className="space-y-3">
                    <FormLabel>{t("loans.form.purpose")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => {
                          field.onChange(val === "Other" ? "" : val);
                          form.setValue("loanType", (val === "Business" || val === "Small Business") ? "BUSINESS" : "OTHER");
                        }}
                        value={displayValue || undefined}
                        className="grid grid-cols-2 md:grid-cols-3 gap-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Business" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.business")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Medical" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.medical")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Education" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.education")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Agriculture" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.agriculture")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Emergency" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.emergency")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="House Repair" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.houseRepair")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Marriage" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.marriage")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Small Business" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.smallBusiness")}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="Other" /></FormControl>
                          <FormLabel className="font-normal">{t("loans.form.purposes.other")}</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {form.watch("loanType") === "BUSINESS" && (
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("loans.form.businessType")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("loans.form.businessTypePlaceholder")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!["Business", "Medical", "Education", "Agriculture", "Emergency", "House Repair", "Marriage", "Small Business"].includes(form.watch("purpose") || "") && form.watch("purpose") !== undefined && (
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("loans.form.reason")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("loans.form.reasonPlaceholder")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
`;

const regex = /<FormField[\s\S]*?name="loanType"[\s\S]*?render={[^]*?return[^]*?<FormItem className="space-y-3">[\s\S]*?<\/FormItem>[\s\S]*?\}\);?[\s\S]*?\}[\s\S]*?\/>[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?\{watchedLoanType === "BUSINESS" && \([\s\S]*?<\/FormItem>[\s\S]*?\}\)[\s\S]*?\}\)[\s\S]*?<\/FormField>[\s\S]*?<\/FormField>[\s\S]*?<\/>[\s\S]*?\)\}[\s\S]*?\{watchedLoanType === "OTHER" && \([\s\S]*?<\/FormField>[\s\S]*?\)\}[\s\S]*?<FormField/g;

// I'll replace the block from <FormField name="loanType" ... to <FormField name="amount" ... with the new block.
const blockRegex = /<FormField[\s\S]*?name="loanType"[\s\S]*?<\/FormItem>\s*\)\);\s*\}\}\s*\/>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\s*\{watchedLoanType === "BUSINESS" && \([\s\S]*?\) \}\)\s*\}\s*\/>\s*\}\)\s*<FormField/g;

code = code.replace(blockRegex, replacement);

fs.writeFileSync('src/features/loans/components/loan-form.tsx', code);
console.log('Fixed loan-form.tsx');
