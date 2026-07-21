"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormValues } from "../schema"
import { createGroup } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function GroupForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GroupFormValues>({
     
    resolver: zodResolver(groupSchema) as any,
    defaultValues: {
      name: "",
      code: "",
      shortName: "",
      description: "",
      status: "ACTIVE",
      openingBalance: 0,
      remarks: "",
    },
  })

  useEffect(() => {
    // Safely auto-generate code on mount
    form.setValue("code", "G-" + Math.floor(1000 + Math.random() * 9000))
  }, [form])

  async function onSubmit(data: GroupFormValues) {
    setIsSubmitting(true)
    const res = await createGroup(data)
    setIsSubmitting(false)

    if (res.success) {
      toast.success("গ্রুপ সফলভাবে সংরক্ষিত হয়েছে")
      router.push("/groups/manage")
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>গ্রুপের বিবরণ</CardTitle>
        <CardDescription>নতুন গ্রুপের জন্য মৌলিক এবং আর্থিক তথ্য লিখুন।</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">মৌলিক তথ্য</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>গ্রুপের নাম <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="গ্রুপের নাম লিখুন" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>গ্রুপ কোড <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="G-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সংক্ষিপ্ত নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="ঐচ্ছিক সংক্ষিপ্ত নাম" {...field} />
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
                            <SelectValue placeholder="একটি অবস্থা নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">সক্রিয়</SelectItem>
                          <SelectItem value="INACTIVE">নিষ্ক্রিয়</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বিবরণ</FormLabel>
                    <FormControl>
                      <Textarea placeholder="গ্রুপের বিবরণ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">আর্থিক তথ্য</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="openingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>প্রারম্ভিক তহবিল</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">অন্যান্য</h3>
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>মন্তব্য</FormLabel>
                    <FormControl>
                      <Textarea placeholder="অন্য কোনো মন্তব্য..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" type="button" onClick={() => router.push("/groups/manage")}>
                বাতিল
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "গ্রুপ সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
