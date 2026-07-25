"use client"

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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const editSchema = z.object({
  donorId: z.string().min(1, "অনুদানদাতা নির্বাচন করুন"),
  groupId: z.string().min(1, "তহবিল গন্তব্য গ্রুপ নির্বাচন করুন"),
  amount: z.coerce.number().min(1, "পরিমাণ আবশ্যক"),
  date: z.string().min(1, "তারিখ আবশ্যক"),
  remarks: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

interface EditDonationSheetProps {
  isOpen: boolean
  onClose: () => void
  donation: DonationTransactionItem | null
  donors: { id: string; fullName: string; donorId: string; mobile: string }[]
  groups: { id: string; name: string }[]
}

export function EditDonationSheet({ isOpen, onClose, donation, donors, groups }: EditDonationSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema as any),
    defaultValues: {
      donorId: "",
      groupId: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      remarks: "",
    },
  })

  useEffect(() => {
    if (donation) {
      form.reset({
        donorId: donation.donorId || "",
        groupId: donation.groupId || "",
        amount: donation.amount || 0,
        date: donation.date ? new Date(donation.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        remarks: donation.remarks || "",
      })
    }
  }, [donation, form])

  if (!donation) return null

  async function onSubmit(data: EditFormValues) {
    setIsSubmitting(true)
    const result = await updateDonationTransaction(donation!.id, {
      donorId: data.donorId,
      groupId: data.groupId,
      amount: data.amount,
      date: data.date,
      remarks: data.remarks,
    })
    setIsSubmitting(false)

    if (result.success) {
      toast.success("অনুদান সফলভাবে আপডেট হয়েছে", { 
        description: "স্বয়ংক্রিয়ভাবে ডোনার লেজার, গ্রুপ লেজার, এবং ড্যাশবোর্ড হিসাব সিঙ্ক্রোনাইজ (Update) করা হয়েছে।" 
      })
      onClose()
    } else {
      toast.error("আপডেট ব্যর্থ হয়েছে", { description: (result as any).error })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>অনুদান লেনদেন সম্পাদনা (Edit Donation)</SheetTitle>
          <SheetDescription>
            অনুদানের তথ্য সম্পাদনা করুন। এটি স্বয়ংক্রিয়ভাবে ডোনার লেজার, গ্রুপ লেজার ও ড্যাশবোর্ড হিসাব আপডেট করবে (Single DB Transaction)।
          </SheetDescription>
        </SheetHeader>

        <div className="my-4 p-3 bg-muted/40 rounded-md border text-sm">
          <p><span className="font-medium text-muted-foreground">ভাউচার নং:</span> {donation.voucherNo}</p>
          <p><span className="font-medium text-muted-foreground">বর্তমান পরিমাণ:</span> ৳{donation.amount}</p>
          <p><span className="font-medium text-muted-foreground">এন্ট্রি করেছেন:</span> {donation.createdBy}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="donorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>অনুদানদাতা (Donor) *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="অনুদানদাতা নির্বাচন করুন" />
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

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>তহবিল গন্তব্য (Selected Group) *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ফাউন্ডেশন গ্রুপ নির্বাচন করুন" />
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
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পরিমাণ (Amount in ৳) *</FormLabel>
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
                  <FormLabel>তারিখ (Date) *</FormLabel>
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
                  <FormLabel>বিবরণ / মন্তব্য (Remarks)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                বাতিল (Cancel)
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "আপডেট হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
