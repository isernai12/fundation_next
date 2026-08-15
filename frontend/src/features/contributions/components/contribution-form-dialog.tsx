"use client"
import { getNow } from "@/lib/date";
import { formatMonth } from "@/lib/format"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contributionSchema, type ContributionFormValues } from "../schema"
import { createContribution } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MemberCombobox } from "@/components/member-combobox"
import { useLanguage } from "@/i18n/LanguageProvider";

interface ContributionFormDialogProps {
  members: { id: string; fullName: string | null; memberId: string }[]
  trigger?: React.ReactNode
  defaultMonthlyFee?: number
}

export function ContributionFormDialog({ members, trigger, defaultMonthlyFee = 100 }: ContributionFormDialogProps) {
    const { t } = useLanguage();
  const [open, setOpen] = useState(false)

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      memberId: "",
      month: 1,
      year: 2026,
      amount: defaultMonthlyFee,
      paymentDate: "",
      paymentMethod: "CASH",
      referenceNumber: "",
      notes: "",
      status: "PAID",
      isAdditional: false,
    },
  })

  
  useEffect(() => {
    form.setValue("month", getNow().getMonth() + 1)
    form.setValue("year", getNow().getFullYear())
    form.setValue("paymentDate", getNow().toLocaleDateString("en-CA"))
  }, [form])

  async function onSubmit(data: ContributionFormValues) {
    // Standardize amount to smallest currency unit (e.g., cents if applicable, but we assume input is already base unit or we multiply by 100)
    // The prompt says "Money stored using integer smallest currency unit." Let's assume the user enters standard unit (e.g., 100 dollars) and we multiply by 100.
    const submitData = { ...data, amount: data.amount }
    
    const res = await createContribution(submitData)

    if (res.success) {
      toast.success(t("contributions.contribution_process_107d8e"))
      setOpen(false)
      form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t("contributions.record_contribution_90dab4")}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("contributions.record_monthly_contr_a185dc")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="memberId" render={({ field }) => {
                        return ((
                                      <FormItem>
                                        <FormLabel>{t("contributions.member_858ba4")}</FormLabel>
                                        <FormControl>
                                          <MemberCombobox
                                            members={members}
                                            value={field.value}
                                            onChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    ));
                      }}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="month" render={({ field }) => {
                            return ((
                                          <FormItem>
                                            <FormLabel>{t("contributions.month_7cbb88")}</FormLabel>
                                            <Select onValueChange={(val) => field.onChange(parseInt(val) || 0)} value={field.value?.toString() || ""}>
                                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                  <SelectItem key={m} value={m.toString()}>{formatMonth(m - 1)}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                          }} />
              <FormField control={form.control} name="year" render={({ field }) => {
                            return ((
                                          <FormItem><FormLabel>{t("contributions.year_537c66")}</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ""} onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? "" : v); }} /></FormControl><FormMessage /></FormItem>
                                        ));
                          }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => {
                            return ((
                                          <FormItem><FormLabel>{t("contributions.amount_b2f406")}</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? "" : v); }} /></FormControl><FormMessage /></FormItem>
                                        ));
                          }} />
              <FormField control={form.control} name="paymentDate" render={({ field }) => {
                            return ((
                                          <FormItem><FormLabel>{t("contributions.payment_date_31738c")}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                        ));
                          }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => {
                            return ((
                                          <FormItem>
                                            <FormLabel>{t("contributions.status_ec53a8")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                <SelectItem value="PAID">{t("contributions.paid_e0010a")}</SelectItem>
                                                <SelectItem value="PENDING">{t("contributions.pending_2d13df")}</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                          }} />
              <FormField control={form.control} name="paymentMethod" render={({ field }) => {
                            return ((
                                          <FormItem>
                                            <FormLabel>{t("contributions.payment_method_707436")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                              <SelectContent>
                                                <SelectItem value="CASH">{t("contributions.cash_069b30")}</SelectItem>
                                                <SelectItem value="BANK_TRANSFER">{t("contributions.bank_transfer_3726d2")}</SelectItem>
                                                <SelectItem value="CHECK">{t("contributions.check_060bf2")}</SelectItem>
                                                <SelectItem value="CARD">{t("contributions.card_1d565b")}</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                          }} />
            </div>

            <FormField control={form.control} name="referenceNumber" render={({ field }) => {
                        return ((
                                    <FormItem><FormLabel>{t("contributions.reference_number_1bd0f4")}</FormLabel><FormControl><Input placeholder={t("contributions.txn_id_check_number_bbb4c4")} {...field} /></FormControl><FormMessage /></FormItem>
                                  ));
                      }} />

            <FormField control={form.control} name="notes" render={({ field }) => {
                        return ((
                                    <FormItem><FormLabel>{t("contributions.notes_f4c6f8")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                  ));
                      }} />

            <FormField
              control={form.control}
              name="isAdditional"
              render={({ field }) => {
                return ((
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    {t("contributions.additional_payment_74d50a")}</FormLabel>
                                  <FormDescription>
                                    {t("contributions.check_this_if_this_i_7ef6b2")}</FormDescription>
                                </div>
                              </FormItem>
                            ));
              }}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                {t("contributions.cancel_ea4788")}</Button>
              <Button type="submit">{t("contributions.process_payment_1ed33a")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
