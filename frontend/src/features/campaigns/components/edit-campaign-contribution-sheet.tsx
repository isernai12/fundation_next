"use client"
import { getNow } from "@/lib/date";

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateCampaignContribution } from "../actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { ContributionItem } from "./view-campaign-contribution-dialog"
import { useLanguage } from "@/i18n/LanguageProvider";

const editSchema = z.object({
  amount: z.number().min(1, "পরিমাণ আবশ্যক"),
  date: z.string().min(1, "তারিখ আবশ্যক"),
  remarks: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

interface EditCampaignContributionSheetProps {
  isOpen: boolean
  onClose: () => void
  contribution: ContributionItem | null
}

export function EditCampaignContributionSheet({ isOpen, onClose, contribution }: EditCampaignContributionSheetProps) {
    const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      amount: contribution?.amount || 0,
      date: contribution?.date ? new Date(contribution.date).toISOString().split('T')[0] : "",
      remarks: contribution?.remarks || "",
    },
  })

  useEffect(() => {
    if (contribution && !contribution.date) {
      form.setValue("date", getNow().toLocaleDateString('en-CA'))
    }
  }, [form, contribution])

  if (!contribution) return null

  const contributorName = contribution.member ? contribution.member.fullName : contribution.donor?.fullName || "অজানা"

  async function onSubmit(data: EditFormValues) {
    setIsSubmitting(true)
    const result = await updateCampaignContribution(contribution!.id, {
      amount: data.amount,
      date: data.date,
      remarks: data.remarks,
    })
    setIsSubmitting(false)

    if (result.success) {
      toast.success(t("campaigns.k_dc1cfd"), { 
        description: "তহবিল লেনদেন এবং সকল সংশ্লিষ্ট লেজার হিসাব সিঙ্ক্রোনাইজ করা হয়েছে।" 
      })
      onClose()
    } else {
      toast.error(t("campaigns.k_f4b1e8"), { description: result.error })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("campaigns.edit_transaction_c8215d")}</SheetTitle>
          <SheetDescription>
            {t("campaigns.k_2505c1")}</SheetDescription>
        </SheetHeader>

        <div className="my-4 p-3 bg-muted/40 rounded-md border text-sm">
          <p><span className="font-medium text-muted-foreground">{t("campaigns.k_0e9310")}</span> {contribution.campaign?.name}</p>
          <p><span className="font-medium text-muted-foreground">{t("campaigns.k_950098")}</span> {contributorName}</p>
          <p><span className="font-medium text-muted-foreground">{t("campaigns.k_80ede2")}</span> {t("campaigns.vch_72f441")}{contribution.ledgerTransactionId.slice(0, 8).toUpperCase()}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("campaigns.amount_in_f7e3e7")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="any" 
                                    value={field.value} 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                                  />
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
                                <FormLabel>{t("campaigns.date_806233")}</FormLabel>
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
                                <FormLabel>{t("campaigns.remarks_d56d03")}</FormLabel>
                                <FormControl>
                                  <Textarea placeholder={t("campaigns.k_23ef5a")} rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t("campaigns.k_c94621")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
