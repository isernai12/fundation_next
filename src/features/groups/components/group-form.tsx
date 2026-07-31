"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormValues } from "../schema"
import { createGroup } from "../actions"
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
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/i18n/LanguageProvider";

export function GroupForm() {
    const { t } = useLanguage();
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GroupFormValues>({
     
    resolver: zodResolver(groupSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      shortName: "",
      description: "",
      status: "ACTIVE",
      openingBalance: 0,
      remarks: "",
    },
  })

  useEffect(() => {
    // Safely auto-generate code on mount
    form.setValue("code", "G-" + Math.floor(1000 + Math.random() * 9000))
  }, [form])

  async function onSubmit(data: GroupFormValues) {
    setIsSubmitting(true)
    const res = await createGroup(data)
    setIsSubmitting(false)

    if (res.success) {
      toast.success(t("groups.k_3e63a1"))
      router.push("/groups/manage")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("groups.k_2479a4")}</CardTitle>
        <CardDescription>{t("groups.k_b6747d")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("groups.k_580a9a")}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return ((
                                      <FormItem>
                                        <FormLabel>{t("groups.k_a29d6e")}<span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                          <Input placeholder={t("groups.k_2a9c32")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    ));
                  }}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => {
                    return ((
                                      <FormItem>
                                        <FormLabel>{t("groups.k_d4410d")}<span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                          <Input placeholder={t("groups.g_001_1f0e19")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    ));
                  }}
                />
                <FormField
                  control={form.control}
                  name="shortName"
                  render={({ field }) => {
                    return ((
                                      <FormItem>
                                        <FormLabel>{t("groups.k_76f621")}</FormLabel>
                                        <FormControl>
                                          <Input placeholder={t("groups.k_bd91e4")} {...field} />
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
                                        <FormLabel>{t("groups.k_8dd4e8")}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t("groups.k_7b7e50")} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="ACTIVE">{t("groups.k_7effec")}</SelectItem>
                                            <SelectItem value="INACTIVE">{t("groups.k_85b224")}</SelectItem>
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
                name="description"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("groups.k_87daaf")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("groups.k_6bd2b3")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">{t("groups.k_b7841d")}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="openingBalance"
                  render={({ field }) => {
                    return ((
                                      <FormItem>
                                        <FormLabel>{t("groups.k_fa7733")}</FormLabel>
                                        <FormControl>
                                          <Input type="number" min="0" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    ));
                  }}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">{t("groups.k_8f019f")}</h3>
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("groups.k_550c03")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("groups.k_817fc2")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" type="button" onClick={() => router.push("/groups/manage")}>
                {t("groups.k_de9b04")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "গ্রুপ সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
