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
import { createCampaignContribution } from "../actions"
import { campaignContributionSchema, CampaignContributionFormValues } from "../schema"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

export function CampaignContributionForm({ 
  campaignId,
  campaigns,
  members
}: { 
  campaignId?: string;
  campaigns: { id: string; name: string }[];
  members: { id: string; fullName: string | null; memberId: string }[];
}) {
    const { t } = useLanguage();
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CampaignContributionFormValues>({
    resolver: zodResolver(campaignContributionSchema),
    defaultValues: {
      campaignId: campaignId || "",
      contributorType: "MEMBER",
      memberId: "",
      donorName: "",
      donorMobile: "",
      donorAddress: "",
      amount: 0,
      date: getNow().toLocaleDateString('en-CA'),
      remarks: "",
    },
  })

  useEffect(() => {
    form.setValue("date", getNow().toLocaleDateString("en-CA"))
  }, [form])

  async function onSubmit(data: CampaignContributionFormValues) {
    setLoading(true)
    const result = await createCampaignContribution(data)
    setLoading(false)

    if (result.success) {
      toast.success(t("campaigns.contribute.form.successMessage"))
      router.push(`/campaigns/${data.campaignId}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="mb-6 shadow-sm border-muted">
      <CardHeader className="py-4 border-b bg-muted/10">
        <CardTitle className="text-lg font-semibold">{t("campaigns.contribute.form.title")}</CardTitle>
        <CardDescription>{t("campaigns.contribute.form.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.contribute.form.activity")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("campaigns.contribute.form.activityPlaceholder")} />
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
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="contributorType"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.contribute.form.contributorType")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("campaigns.contribute.form.contributorTypePlaceholder")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="MEMBER">{t("campaigns.contribute.form.typeMember")}</SelectItem>
                                        <SelectItem value="DONOR">{t("campaigns.contribute.form.typeDonor")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              {form.watch("contributorType") === "MEMBER" ? (
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => {
                    return ((
                                      <FormItem>
                                        <FormLabel>{t("campaigns.contribute.form.member")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t("campaigns.contribute.form.memberPlaceholder")} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {members.map(m => (
                                              <SelectItem key={m.id} value={m.id}>{m.fullName} ({m.memberId})</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    ));
                  }}
                />
              ) : (
                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{t("campaigns.contribute.form.nonMemberDetails")}</h4>
                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => {
                      return ((
                                          <FormItem>
                                            <FormLabel>{t("campaigns.contribute.form.donorName")}</FormLabel>
                                            <FormControl>
                                              <Input placeholder={t("campaigns.contribute.form.donorNamePlaceholder")} {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="donorMobile"
                    render={({ field }) => {
                      return ((
                                          <FormItem>
                                            <FormLabel>{t("campaigns.contribute.form.donorMobile")}</FormLabel>
                                            <FormControl>
                                              <Input placeholder={t("campaigns.contribute.form.donorMobilePlaceholder")} {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="donorAddress"
                    render={({ field }) => {
                      return ((
                                          <FormItem>
                                            <FormLabel>{t("campaigns.contribute.form.donorAddress")}</FormLabel>
                                            <FormControl>
                                              <Input placeholder={t("campaigns.contribute.form.donorAddressPlaceholder")} {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                    }}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.contribute.form.amount")}</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.contribute.form.date")}</FormLabel>
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
                name="remarks"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.contribute.form.remarks")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.contribute.form.remarksPlaceholder")} {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t("campaigns.contribute.form.cancel")}</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("campaigns.contribute.form.save")}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
