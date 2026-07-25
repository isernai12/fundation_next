"use client"

import { useState } from "react"
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      amount: contribution?.amount || 0,
      date: contribution?.date ? new Date(contribution.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      remarks: contribution?.remarks || "",
    },
  })

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
      toast.success("সফলভাবে আপডেট হয়েছে", { 
        description: "তহবিল লেনদেন এবং সকল সংশ্লিষ্ট লেজার হিসাব সিঙ্ক্রোনাইজ করা হয়েছে।" 
      })
      onClose()
    } else {
      toast.error("আপডেট ব্যর্থ হয়েছে", { description: result.error })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>তহবিল লেনদেন সম্পাদনা (Edit Transaction)</SheetTitle>
          <SheetDescription>
            লেনদেনের পরিমাণ, তারিখ বা বিবরণ সম্পাদনা করুন। এটি স্বয়ংক্রিয়ভাবে তহবিল লেজার, ডোনার লেজার, এবং ড্যাশবোর্ড সামারী আপডেট করবে।
          </SheetDescription>
        </SheetHeader>

        <div className="my-4 p-3 bg-muted/40 rounded-md border text-sm">
          <p><span className="font-medium text-muted-foreground">তহবিল:</span> {contribution.campaign?.name}</p>
          <p><span className="font-medium text-muted-foreground">প্রদানকারী:</span> {contributorName}</p>
          <p><span className="font-medium text-muted-foreground">ভাউচার:</span> VCH-{contribution.ledgerTransactionId.slice(0, 8).toUpperCase()}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পরিমাণ (Amount in ৳)</FormLabel>
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
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>তারিখ (Date)</FormLabel>
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
                  <FormLabel>মন্তব্য / বিবরণ (Remarks)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="লেনদেন সম্পর্কিত মন্তব্য লিখুন..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                বাতিল করুন
              </Button>
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
