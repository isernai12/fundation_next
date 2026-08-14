"use client"
import { getNow } from "@/lib/date";

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createBeneficiaryPayment } from "../actions"
import { beneficiaryPaymentSchema, BeneficiaryPaymentFormValues } from "../schema"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

export function DistributeForm({ 
  campaigns,
  beneficiaries
}: { 
  campaigns: { id: string; name: string; balance: number }[];
  beneficiaries: { id: string; fullName: string | null; beneficiaryId: string }[];
}) {
  const { t } = useLanguage();
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<BeneficiaryPaymentFormValues>({
    resolver: zodResolver(beneficiaryPaymentSchema),
    defaultValues: {
      campaignId: "",
      beneficiaryId: "",
      amount: 0,
      date: getNow().toLocaleDateString('en-CA'),
      reason: "",
      referenceNumber: "",
      comments: "",
    },
  })

  useEffect(() => {
    form.setValue("date", getNow().toLocaleDateString("en-CA"))
  }, [form])

  const selectedCampaignId = form.watch("campaignId")
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)

  async function onSubmit(data: BeneficiaryPaymentFormValues) {
    if (selectedCampaign && data.amount > selectedCampaign.balance) {
      toast.error(t("campaigns.distribute.form.errorMessage") || "Insufficient Balance")
      return
    }

    setLoading(true)
    const result = await createBeneficiaryPayment(data)
    setLoading(false)

    if (result.success) {
      toast.success(t("campaigns.distribute.form.successMessage"))
      router.push(`/campaigns/${data.campaignId}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="mb-6 shadow-sm border-muted">
      <CardHeader className="py-4 border-b bg-muted/10">
        <CardTitle className="text-lg font-semibold">{t("campaigns.distribute.form.title")}</CardTitle>
        <CardDescription>{t("campaigns.distribute.form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaigns.distribute.form.activity")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("campaigns.distribute.form.activityPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-end">
                {selectedCampaign && (
                  <div className="p-3 bg-muted rounded-md text-sm border flex justify-between items-center">
                    <span className="text-muted-foreground">{t("campaigns.distribute.form.currentBalance")}:</span>
                    <span className="font-bold text-lg text-primary">{selectedCampaign.balance.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="beneficiaryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaigns.distribute.form.beneficiary")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("campaigns.distribute.form.beneficiaryPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {beneficiaries.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.fullName} ({b.beneficiaryId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaigns.distribute.form.amount")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaigns.distribute.form.date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaigns.distribute.form.reason")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("campaigns.distribute.form.reasonPlaceholder")} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("campaigns.distribute.form.reference")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("campaigns.distribute.form.referencePlaceholder")} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("campaigns.distribute.form.comments")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("campaigns.distribute.form.commentsPlaceholder")} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t("campaigns.distribute.form.cancel")}</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("campaigns.distribute.form.save")}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
