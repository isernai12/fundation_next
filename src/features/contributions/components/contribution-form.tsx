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
      toast.success(t("contributions.k_469c39"))
      router.push("/contributions")
    } else {
      toast.error(res.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে")
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-5xl mx-auto shadow-sm border mt-4">
      <CardHeader className="border-b mb-6 pb-4">
        <CardTitle className="text-xl font-bold">{t("contributions.k_f0d1bb")}</CardTitle>
        <CardDescription>{t("contributions.k_f54ce0")}</CardDescription>
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
                                    <FormLabel>{t("contributions.k_868b90")}</FormLabel>
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
                                    <FormLabel>{t("contributions.k_568d0e")}</FormLabel>
                                    <Select 
                                      onValueChange={v => field.onChange(parseInt(v) || 0)} 
                                      defaultValue={field.value?.toString()}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("contributions.k_1e1467")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                          <SelectItem key={m} value={m.toString()}>
                                            {bengaliMonths[m - 1]}
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
                                    <FormLabel>{t("contributions.k_4083b2")}</FormLabel>
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
                                    <FormLabel>{t("contributions.k_63998c")}</FormLabel>
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
                                    <FormLabel>{t("contributions.k_d6954c")}</FormLabel>
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
                                    <FormLabel>{t("contributions.k_ab3ed0")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("contributions.k_353488")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="CASH">{t("contributions.k_b43e1f")}</SelectItem>
                                        <SelectItem value="BANK">{t("contributions.k_c6edc5")}</SelectItem>
                                        <SelectItem value="MOBILE_MONEY">{t("contributions.k_09e92d")}</SelectItem>
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
                                    <FormLabel>{t("contributions.k_c2d029")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("contributions.k_ff596f")} {...field} />
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
                                    <FormLabel>{t("contributions.k_8dd4e8")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("contributions.k_ab7f1a")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="PAID">{t("contributions.k_2c893a")}</SelectItem>
                                        <SelectItem value="PENDING">{t("contributions.k_277e03")}</SelectItem>
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
                                <FormLabel>{t("contributions.k_550c03")}</FormLabel>
                                <FormControl>
                                  <Textarea placeholder={t("contributions.k_b5321c")} className="resize-none" {...field} />
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
                                    {t("contributions.k_f3a483")}</FormLabel>
                                  <CardDescription>
                                    {t("contributions.k_35750c")}</CardDescription>
                                </div>
                              </FormItem>
                            ));
              }}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/contributions")}>
                {t("contributions.k_de9b04")}</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
