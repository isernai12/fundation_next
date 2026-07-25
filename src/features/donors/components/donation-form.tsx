"use client"
import { useState } from "react"
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

const formSchema = z.object({
  donorId: z.string().min(1, "অনুদানদাতা নির্বাচন করুন (Select a donor)"),
  groupId: z.string().min(1, "তহবিল গন্তব্য নির্বাচন করুন (Select a group)"),
  amount: z.coerce.number().min(1, "পরিমাণ আবশ্যক (Amount is required)"),
  date: z.string().min(1, "তারিখ আবশ্যক (Date is required)"),
  remarks: z.string().optional(),
})

export function DonationForm({ 
  donors, 
  groups 
}: { 
  donors: { id: string, fullName: string, donorId: string, mobile: string }[],
  groups: { id: string, name: string }[] 
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      donorId: "",
      groupId: "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      remarks: "",
    }
  })

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
      toast.success("অনুদান সফলভাবে গ্রহণ করা হয়েছে")
      router.push("/donors/donations")
    } else {
      toast.error((res as any).error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>অনুদান গ্রহণ (Receive Donation)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="donorId"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>অনুদানদাতা (Donor) *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>তহবিল গন্তব্য (Foundation Group) *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel>পরিমাণ (Amount) *</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
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
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>মন্তব্য (Remarks)</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            বাতিল (Cancel)
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "অনুদান গ্রহণ করুন"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
