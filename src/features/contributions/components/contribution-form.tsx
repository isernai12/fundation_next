"use client"
import { getNow } from "@/lib/date";

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createContribution } from "../actions"
import { contributionSchema, type ContributionFormValues } from "../schema"
import { MemberCombobox } from "@/components/member-combobox"
import { useLanguage } from "@/i18n/LanguageProvider";

const bengaliMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export function ContributionForm({ members }: { members: { id: string; memberId: string; fullName: string | null; group: { name: string; code: string } | null }[] }) {
    const { t } = useLanguage();
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const defaultValues: Partial<ContributionFormValues> = {
    memberId: "",
    month: 1,
    year: 2026,
    amount: 0,
    paymentDate: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    notes: "",
    status: "PAID",
    isAdditional: false,
  }

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues,
  })

  
  useEffect(() => {
    form.setValue("month", getNow().getMonth() + 1)
    form.setValue("year", getNow().getFullYear())
    form.setValue("paymentDate", getNow().toLocaleDateString("en-CA"))
  }, [form])

  async function onSubmit(data: ContributionFormValues) {
    setLoading(true)
    const res = await createContribution(data)
    if (res.success) {
      toast.success(t("contributions.form.successMessage"))
      router.push("/contributions")
    } else {
      toast.error(res.error || t("contributions.form.errorMessage"))
    }
    setLoading(false)
  }

  return (
    <Card className="mb-6 shadow-sm border-muted max-w-5xl mx-auto">
      <CardHeader className="py-4 border-b bg-muted/10">
        <CardTitle className="text-lg font-semibold">{t("contributions.form.title")}</CardTitle>
        <CardDescription>{t("contributions.form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => {
                  return ((
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>{t("contributions.form.member")}</FormLabel>
                                    <FormControl>
                                      <MemberCombobox
                                        members={members}
                                        value={field.value}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.month")}</FormLabel>
                                    <Select 
                                      onValueChange={v => field.onChange(parseInt(v) || 0)} 
                                      defaultValue={field.value?.toString()}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("contributions.form.monthPlaceholder")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                          <SelectItem key={m} value={m.toString()}>
                                            {(() => { const arr = t("contributions.months"); return Array.isArray(arr) ? arr[m - 1] : t(`contributions.months.${m - 1}`); })()}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.year")}</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} value={field.value ?? ""} onChange={e => {
                                        const val = parseInt(e.target.value);
                                        field.onChange(isNaN(val) ? "" : val);
                                      }} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.amount")}</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        field.onChange(isNaN(val) ? "" : val);
                                      }} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.paymentDate")}</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.paymentMethod")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("contributions.form.paymentMethodPlaceholder")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="CASH">{t("contributions.form.methods.cash")}</SelectItem>
                                        <SelectItem value="BANK">{t("contributions.form.methods.bank")}</SelectItem>
                                        <SelectItem value="MOBILE_MONEY">{t("contributions.form.methods.mobile")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.reference")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("contributions.form.referencePlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.form.status")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("contributions.form.statusPlaceholder")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="PAID">{t("contributions.form.statuses.paid")}</SelectItem>
                                        <SelectItem value="PENDING">{t("contributions.form.statuses.pending")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("contributions.form.notes")}</FormLabel>
                                <FormControl>
                                  <Textarea placeholder={t("contributions.form.notesPlaceholder")} className="resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <FormField
              control={form.control}
              name="isAdditional"
              render={({ field }) => {
                return ((
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    {t("contributions.form.isAdditional")}</FormLabel>
                                  <CardDescription>
                                    {t("contributions.form.isAdditionalDescription")}</CardDescription>
                                </div>
                              </FormItem>
                            ));
              }}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/contributions")}>
                {t("contributions.form.cancel")}</Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("contributions.form.saving") : t("contributions.form.save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
