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
      toast.success(t("contributions.edit.success"))
      onClose()
    } else {
      toast.error(result.error || t("contributions.form.errorMessage"))
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("contributions.edit.title")}</SheetTitle>
          <SheetDescription>
            {t("contributions.edit.description")}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("contributions.form.status")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("contributions.form.statusPlaceholder")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {["PENDING", "PAID", "CANCELLED"].map((status) => (
                                      <SelectItem key={status === "PAID" ? t("contributions.form.statuses.paid") : status === "PENDING" ? t("contributions.form.statuses.pending") : t("contributions.form.statuses.cancelled")} value={status === "PAID" ? t("contributions.form.statuses.paid") : status === "PENDING" ? t("contributions.form.statuses.pending") : t("contributions.form.statuses.cancelled")}>
                                        {status === "PAID" ? t("contributions.form.statuses.paid") : status === "PENDING" ? t("contributions.form.statuses.pending") : t("contributions.form.statuses.cancelled")}
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
                                    <FormLabel>{t("contributions.form.amount")}</FormLabel>
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
                                    <FormLabel>{t("contributions.form.paymentDate")}</FormLabel>
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
                                <FormLabel>{t("contributions.form.paymentMethod")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("contributions.form.paymentMethodPlaceholder")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="CASH">{t("contributions.form.methods.cash")}</SelectItem>
                                    <SelectItem value="BKASH">{t("contributions.form.methods.bkash")}</SelectItem>
                                    <SelectItem value="NAGAD">{t("contributions.form.methods.nagad")}</SelectItem>
                                    <SelectItem value="BANK">{t("contributions.form.methods.bank")}</SelectItem>
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
                                <FormLabel>{t("contributions.form.reference")}</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder={t("contributions.form.referencePlaceholder")} />
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
                                <FormLabel>{t("contributions.form.notes")}</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder={t("contributions.form.notesPlaceholder")} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <div className="pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("contributions.form.cancel")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("contributions.form.saving") : t("contributions.form.save")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
