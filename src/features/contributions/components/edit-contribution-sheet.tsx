"use client"
import { getNow } from "@/lib/date";

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contributionSchema, type ContributionFormValues } from "../schema"
import { updateContribution } from "../actions"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useLanguage } from "@/i18n/LanguageProvider";

interface EditContributionSheetProps {
  isOpen: boolean
  onClose: () => void
  contribution: any
}

export function EditContributionSheet({ isOpen, onClose, contribution }: EditContributionSheetProps) {
    const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const payment = contribution.payments?.[0] || null

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      memberId: contribution.memberId,
      month: contribution.month,
      year: contribution.year,
      amount: payment ? payment.amount : contribution.expectedAmount,
      paymentDate: payment ? new Date(payment.paymentDate).toISOString().split('T')[0] : "",
      paymentMethod: payment ? payment.paymentMethod : "CASH",
      referenceNumber: payment?.referenceNumber || "",
      notes: payment?.notes || "",
      status: contribution.status,
      isAdditional: contribution.isAdditional,
    },
  })

  useEffect(() => {
    if (!payment) {
      form.setValue("paymentDate", getNow().toLocaleDateString('en-CA'))
    }
  }, [form, payment])

  async function onSubmit(data: ContributionFormValues) {
    setIsSubmitting(true)
    const result = await updateContribution(contribution.id, data)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(t("contributions.success_505a83"), { description: "Contribution updated successfully" })
      onClose()
    } else {
      toast.error(t("contributions.error_902b0d"), { description: result.error })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("contributions.edit_contribution_bfb6c5")}</SheetTitle>
          <SheetDescription>
            {t("contributions.update_the_contribut_157ded")}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("contributions.status_ec53a8")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("contributions.select_status_9aadb0")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {["PENDING", "PAID", "CANCELLED"].map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {status}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("contributions.amount_31ee20")}</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? "" : v); }} />
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
                                    <FormLabel>{t("contributions.payment_date_31738c")}</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("contributions.payment_method_707436")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("contributions.select_payment_metho_7768d9")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="CASH">{t("contributions.cash_069b30")}</SelectItem>
                                    <SelectItem value="BKASH">{t("contributions.bkash_bb9796")}</SelectItem>
                                    <SelectItem value="NAGAD">{t("contributions.nagad_fea32f")}</SelectItem>
                                    <SelectItem value="BANK">{t("contributions.bank_transfer_3726d2")}</SelectItem>
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
                                <FormLabel>{t("contributions.reference_number_opt_5157c0")}</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder={t("contributions.trxid_or_receipt_num_aafb14")} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("contributions.remarks_notes_58e223")}</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder={t("contributions.any_additional_notes_65a3f7")} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("contributions.cancel_ea4788")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
