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
      toast.success(t("campaigns.new.form.successMessage"))
      router.push("/campaigns/manage")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="mb-6 shadow-sm border-muted">
      <CardHeader className="py-4 border-b bg-muted/10">
        <CardTitle className="text-lg font-semibold">{t("campaigns.new.form.title")}</CardTitle>
        <CardDescription>{t("campaigns.new.form.description")}</CardDescription>
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
                                    <FormLabel>{t("campaigns.new.form.activityName")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.new.form.activityNamePlaceholder")} {...field} />
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
                                    <FormLabel>{t("campaigns.new.form.purpose")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.new.form.purposePlaceholder")} {...field} />
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
                                    <FormLabel>{t("campaigns.new.form.detailedDescription")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("campaigns.new.form.detailedDescriptionPlaceholder")} {...field} />
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
                                    <FormLabel>{t("campaigns.new.form.targetAmount")}</FormLabel>
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
                                    <FormLabel>{t("campaigns.new.form.status")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("campaigns.new.form.statusSelect")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ACTIVE">{t("campaigns.new.form.statusActive")}</SelectItem>
                                        <SelectItem value="COMPLETED">{t("campaigns.new.form.statusCompleted")}</SelectItem>
                                        <SelectItem value="CANCELLED">{t("campaigns.new.form.statusCancelled")}</SelectItem>
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
                                    <FormLabel>{t("campaigns.new.form.startDate")}</FormLabel>
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
                                    <FormLabel>{t("campaigns.new.form.endDate")}</FormLabel>
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
                                    <FormLabel>{t("campaigns.new.form.comment")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("campaigns.new.form.commentPlaceholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/campaigns/manage")}>
                {t("campaigns.new.form.cancel")}</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t("campaigns.new.form.save")}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
