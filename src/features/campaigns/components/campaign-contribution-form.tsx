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
    form.setValue("month", getNow().getMonth() + 1)
    form.setValue("year", getNow().getFullYear())
    form.setValue("paymentDate", getNow().toLocaleDateString("en-CA"))
  }, [form])

  async function onSubmit(data: CampaignContributionFormValues) {
    setLoading(true)
    const result = await createCampaignContribution(data)
    setLoading(false)

    if (result.success) {
      toast.success(t("campaigns.k_496477"))
      router.push(`/campaigns/${data.campaignId}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border mt-4">
      <CardHeader className="border-b mb-6 pb-4">
        <CardTitle className="text-xl font-bold">{t("campaigns.k_743724")}</CardTitle>
        <CardDescription>{t("campaigns.k_aca7f0")}</CardDescription>
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
                                    <FormLabel>{t("campaigns.k_7993be")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("campaigns.k_f1c840")} />
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
                                    <FormLabel>{t("campaigns.k_c7024f")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("campaigns.k_1e7dac")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="MEMBER">{t("campaigns.member_c6399c")}</SelectItem>
                                        <SelectItem value="DONOR">{t("campaigns.non_member_donor_96a797")}</SelectItem>
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
                                        <FormLabel>{t("campaigns.k_868b90")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t("campaigns.k_ac0a3e")} />
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
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{t("campaigns.non_member_23ba4d")}</h4>
                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => {
                      return ((
                                          <FormItem>
                                            <FormLabel>{t("campaigns.k_3e0517")}</FormLabel>
                                            <FormControl>
                                              <Input placeholder={t("campaigns.k_2b0d66")} {...field} value={field.value || ""} />
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
                                            <FormLabel>{t("campaigns.k_651920")}</FormLabel>
                                            <FormControl>
                                              <Input placeholder={t("campaigns.xxxxxxxx_0bf2d6")} {...field} value={field.value || ""} />
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
                                            <FormLabel>{t("campaigns.k_a013d4")}</FormLabel>
                                            <FormControl>
                                              <Input placeholder={t("campaigns.k_8bf609")} {...field} value={field.value || ""} />
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
                                    <FormLabel>{t("campaigns.k_2ecc6c")}</FormLabel>
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
                                    <FormLabel>{t("campaigns.k_388121")}</FormLabel>
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
                                    <FormLabel>{t("campaigns.k_550c03")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.k_d44d54")} {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t("campaigns.k_c94621")}</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("campaigns.k_f0d438")}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
