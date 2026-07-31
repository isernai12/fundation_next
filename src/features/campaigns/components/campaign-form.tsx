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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createCampaign } from "../actions"
import { campaignSchema, CampaignFormValues } from "../schema"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

export function CampaignForm() {
    const { t } = useLanguage();
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      purpose: "",
      description: "",
      targetAmount: 0,
      startDate: "",
      endDate: "",
      status: "ACTIVE",
      remarks: "",
    },
  })

  
  useEffect(() => {
    form.setValue("startDate", getNow().toLocaleDateString('en-CA'))
  }, [form])

  async function onSubmit(data: CampaignFormValues) {
    setLoading(true)
    const result = await createCampaign(data)
    setLoading(false)

    if (result.success) {
      toast.success(t("campaigns.k_18d302"))
      router.push("/campaigns/manage")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-sm border mt-4">
      <CardHeader className="border-b mb-6 pb-4">
        <CardTitle className="text-xl font-bold">{t("campaigns.k_7446b5")}</CardTitle>
        <CardDescription>{t("campaigns.k_1e0185")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  return ((
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>{t("campaigns.k_f78574")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.k_896249")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => {
                  return ((
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>{t("campaigns.k_93721f")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.k_94d815")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  return ((
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>{t("campaigns.k_ead56b")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("campaigns.k_6781f2")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.k_f6bd64")}</FormLabel>
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
                name="status"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.k_5f429a")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("campaigns.k_943add")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ACTIVE">{t("campaigns.active_fe0b1d")}</SelectItem>
                                        <SelectItem value="COMPLETED">{t("campaigns.completed_c17809")}</SelectItem>
                                        <SelectItem value="CANCELLED">{t("campaigns.cancelled_4890e5")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.k_b4bc76")}</FormLabel>
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
                name="endDate"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("campaigns.k_aa85e4")}</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} value={field.value || ""} />
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
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>{t("campaigns.k_550c03")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.k_865b82")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/campaigns/manage")}>
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
