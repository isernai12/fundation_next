"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createContribution } from "../actions"
import { contributionSchema, type ContributionFormValues } from "../schema"
import { MemberCombobox } from "@/components/member-combobox"

const bengaliMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export function ContributionForm({ members }: { members: { id: string; memberId: string; fullName: string | null; group: { name: string; code: string } | null }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const defaultValues: Partial<ContributionFormValues> = {
    memberId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "CASH",
    referenceNumber: "",
    notes: "",
    status: "PAID",
    isAdditional: false,
  }

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues,
  })

  async function onSubmit(data: ContributionFormValues) {
    setLoading(true)
    const res = await createContribution(data)
    if (res.success) {
      toast.success("চাঁদার তথ্য সফলভাবে সংরক্ষণ করা হয়েছে")
      router.push("/contributions")
    } else {
      toast.error(res.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে")
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-5xl mx-auto shadow-sm border mt-4">
      <CardHeader className="border-b mb-6 pb-4">
        <CardTitle className="text-xl font-bold">চাঁদা গ্রহণ</CardTitle>
        <CardDescription>সদস্যের নতুন চাঁদার তথ্য এন্ট্রি করুন</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>সদস্য *</FormLabel>
                    <FormControl>
                      <MemberCombobox
                        members={members}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>মাস</FormLabel>
                    <Select 
                      onValueChange={v => field.onChange(parseInt(v) || 0)} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="মাস নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <SelectItem key={m} value={m.toString()}>
                            {bengaliMonths[m - 1]}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বছর</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} onChange={e => {
                        const val = parseInt(e.target.value);
                        field.onChange(isNaN(val) ? "" : val);
                      }} />
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
                    <FormLabel>চাঁদার পরিমাণ (৳)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => {
                        const val = parseFloat(e.target.value);
                        field.onChange(isNaN(val) ? "" : val);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>জমাদানের তারিখ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পরিশোধের মাধ্যম</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="মাধ্যম নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CASH">ক্যাশ (নগদ)</SelectItem>
                        <SelectItem value="BANK">ব্যাংক ট্রান্সফার</SelectItem>
                        <SelectItem value="MOBILE_MONEY">মোবাইল ব্যাংকিং</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ট্রানজেকশন রেফারেন্স (ঐচ্ছিক)</FormLabel>
                    <FormControl>
                      <Input placeholder="রসিদ বা ট্রানজেকশন আইডি" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>অবস্থা</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="অবস্থা নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAID">পরিশোধিত</SelectItem>
                        <SelectItem value="PENDING">বকেয়া</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মন্তব্য</FormLabel>
                  <FormControl>
                    <Textarea placeholder="অতিরিক্ত কোনো মন্তব্য..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdditional"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      অতিরিক্ত চাঁদা
                    </FormLabel>
                    <CardDescription>
                      একই মাসের জন্য অতিরিক্ত কোনো চাঁদা (যেমন জরিমানা বা বিশেষ জমা) হলে এটি নির্বাচন করুন।
                    </CardDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/contributions")}>
                বাতিল
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
