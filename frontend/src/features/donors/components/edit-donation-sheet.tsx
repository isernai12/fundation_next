"use client"
import { getNow } from "@/lib/date";

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateDonationTransaction, type DonationTransactionItem } from "../actions"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useLanguage } from "@/i18n/LanguageProvider";
import { MemberCombobox, type ComboboxMember } from "@/components/member-combobox"
import { GroupCombobox } from "@/components/group-combobox"
import { UserCheck, Users } from "lucide-react"

const editSchema = z.object({
  sourceType: z.enum(["MEMBER", "DONOR"]),
  memberId: z.string().optional(),
  donorId: z.string().optional(),
  groupId: z.string().min(1, "Group is required"),
  amount: z.coerce.number().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  remarks: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.sourceType === "MEMBER") {
    if (!data.memberId || data.memberId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["memberId"],
        message: "Foundation Member is required",
      })
    }
  } else if (data.sourceType === "DONOR") {
    if (!data.donorId || data.donorId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["donorId"],
        message: "Donor is required",
      })
    }
  }
})

type EditFormValues = z.infer<typeof editSchema>

interface EditDonationSheetProps {
  isOpen: boolean
  onClose: () => void
  donation: DonationTransactionItem | null
  donors: { id: string; fullName: string; donorId: string; mobile: string }[]
  members?: ComboboxMember[]
  groups: { id: string; name: string }[]
}

export function EditDonationSheet({ isOpen, onClose, donation, donors, members = [], groups }: EditDonationSheetProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema as any),
    defaultValues: {
      sourceType: "DONOR",
      memberId: "",
      donorId: "",
      groupId: "",
      amount: 0,
      date: "",
      remarks: "",
    },
  })

  const sourceType = form.watch("sourceType")
  const selectedMemberId = form.watch("memberId")
  const selectedMember = members.find(m => m.id === selectedMemberId)

  useEffect(() => {
    if (donation) {
      form.reset({
        sourceType: donation.sourceType || "DONOR",
        memberId: donation.memberId || "",
        donorId: donation.donorId || "",
        groupId: donation.groupId || "",
        amount: donation.amount || 0,
        date: donation.date ? new Date(donation.date).toISOString().split("T")[0] : getNow().toLocaleDateString('en-CA'),
        remarks: donation.remarks || "",
      })
    }
  }, [donation, form])

  if (!donation) return null

  async function onSubmit(data: EditFormValues) {
    setIsSubmitting(true)
    const result = await updateDonationTransaction(donation!.id, {
      sourceType: data.sourceType,
      memberId: data.sourceType === "MEMBER" ? data.memberId : null,
      donorId: data.sourceType === "DONOR" ? data.donorId : null,
      groupId: data.groupId,
      amount: data.amount,
      date: data.date,
      remarks: data.remarks,
    })
    setIsSubmitting(false)

    if (result.success) {
      toast.success(t("donors.k_b3d00a"), { 
        description: t("donors.edit_donation.sync_success") 
      })
      onClose()
    } else {
      toast.error(t("donors.k_f4b1e8"), { description: (result as any).error })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("donors.edit_donation_ddd78c")}</SheetTitle>
          <SheetDescription>
            {t("donors.single_db_transactio_12c012")}</SheetDescription>
        </SheetHeader>

        <div className="my-4 p-3 bg-muted/40 rounded-md border text-sm">
          <p><span className="font-medium text-muted-foreground">{t("donors.k_347e5a")}</span> {donation.voucherNo}</p>
          <p><span className="font-medium text-muted-foreground">{t("donors.k_25bccc")}</span> ৳{donation.amount}</p>
          <p><span className="font-medium text-muted-foreground">{t("donors.k_d6b11f")}</span> {donation.createdBy}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="sourceType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("donors.donation_source")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (val === "MEMBER") {
                          form.setValue("donorId", "")
                        } else {
                          form.setValue("memberId", "")
                        }
                      }}
                      value={field.value}
                      className="grid grid-cols-2 gap-3"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-2.5 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="DONOR" />
                        </FormControl>
                        <Label className="font-medium cursor-pointer flex items-center gap-1.5 text-xs">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{t("donors.source_donor")}</span>
                        </Label>
                      </FormItem>
                      
                      <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-2.5 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="MEMBER" />
                        </FormControl>
                        <Label className="font-medium cursor-pointer flex items-center gap-1.5 text-xs">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t("donors.source_member")}</span>
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sourceType === "MEMBER" ? (
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("donors.member_label")}</FormLabel>
                    <FormControl>
                      <MemberCombobox
                        members={members}
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val)
                          const mem = members.find(m => m.id === val)
                          if (mem?.group?.name) {
                            const matchGroup = groups.find(g => g.name === mem.group?.name)
                            if (matchGroup) form.setValue("groupId", matchGroup.id)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {selectedMember && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedMember.fullName} ({selectedMember.memberId})
                      </p>
                    )}
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="donorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("donors.donor_462f00")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
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
                )}
              />
            )}

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("donors.selected_group_06aad2")}</FormLabel>
                  <FormControl>
                    <GroupCombobox
                      groups={groups.map((g) => ({
                        id: g.id,
                        name: g.name,
                        code: (g as any).code || g.name.substring(0, 3).toUpperCase(),
                        isFoundationGroup: (g as any).isFoundationGroup,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("donors.k_4a6394")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("donors.amount_in_108419")}</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("donors.date_fd1a4c")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("donors.remarks_19ab1b")}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("donors.cancel_adfff0")}</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("donors.edit_donation.updating") : t("donors.edit_donation.save_changes")}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
