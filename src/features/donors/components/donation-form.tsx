"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { receiveDonation } from "../actions"
import { format } from "date-fns"
import { useLanguage } from "@/i18n/LanguageProvider";

const formSchema = z.object({
  donorId: z.string().min(1, "Donor is required"),
  groupId: z.string().min(1, "Group is required"),
  amount: z.number().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  remarks: z.string().optional(),
})

export function DonationForm({ 
  donors, 
  groups 
}: { 
  donors: { id: string, fullName: string, donorId: string, mobile: string }[],
  groups: { id: string, name: string }[] 
}) {
    const { t } = useLanguage();
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorId: "",
      groupId: "",
      amount: 0,
      date: "",
      remarks: "",
    }
  })

    useEffect(() => {
    form.setValue("date", format(new Date(), "yyyy-MM-dd"))
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    const res = await receiveDonation({
      donorId: values.donorId,
      groupId: values.groupId,
      amount: values.amount,
      date: values.date,
      remarks: values.remarks,
    })

    setIsSubmitting(false)

    if (res.success) {
      toast.success(t("donors.k_a37172"))
      router.push("/donors/donations")
    } else if (res && 'error' in res) {
      toast.error(String(res.error))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t("donors.receive_donation_9b92b8")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="donorId"
                render={({ field }) => {
                  return ((
                                  <FormItem className="col-span-1 md:col-span-2">
                                    <FormLabel>{t("donors.donor_462f00")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("donors.k_1d5605")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {donors.map((d) => (
                                          <SelectItem key={d.id} value={d.id}>
                                            {d.fullName} ({d.donorId}) - {d.mobile}
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
                name="groupId"
                render={({ field }) => {
                  return ((
                                  <FormItem className="col-span-1 md:col-span-2">
                                    <FormLabel>{t("donors.foundation_group_ce625d")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("donors.k_4a6394")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {groups.map((g) => (
                                          <SelectItem key={g.id} value={g.id}>
                                            {g.name}
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
                name="amount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("donors.amount_5fb1f4")}</FormLabel>
                                    <FormControl><Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
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
                                    <FormLabel>{t("donors.date_fd1a4c")}</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
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
                                  <FormItem className="col-span-1 md:col-span-2">
                                    <FormLabel>{t("donors.remarks_900bfa")}</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("donors.cancel_adfff0")}</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("donors.donation_form.saving") : t("donors.donation_form.receive_donation")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
