"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createCampaign } from "../actions"
import { campaignSchema, CampaignFormValues } from "../schema"
import { Loader2 } from "lucide-react"

export function CampaignForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      purpose: "",
      description: "",
      targetAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      status: "ACTIVE",
      remarks: "",
    },
  })

  async function onSubmit(data: CampaignFormValues) {
    setLoading(true)
    const result = await createCampaign(data)
    setLoading(false)

    if (result.success) {
      toast.success("তহবিল কার্যক্রম সফলভাবে তৈরি হয়েছে")
      router.push("/campaigns/manage")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-sm border mt-4">
      <CardHeader className="border-b mb-6 pb-4">
        <CardTitle className="text-xl font-bold">নতুন তহবিল কার্যক্রম</CardTitle>
        <CardDescription>নতুন একটি তহবিল সংগ্রহের কার্যক্রম বা ক্যাম্পেইন শুরু করুন</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>কার্যক্রমের নাম *</FormLabel>
                    <FormControl>
                      <Input placeholder="উদা: বিবাহ সহায়তা তহবিল" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>উদ্দেশ্য *</FormLabel>
                    <FormControl>
                      <Input placeholder="কার্যক্রমের মূল উদ্দেশ্য লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>বিস্তারিত বিবরণ</FormLabel>
                    <FormControl>
                      <Textarea placeholder="বিস্তারিত তথ্য লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>লক্ষ্যমাত্রা (টাকা) (ঐচ্ছিক)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
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
                    <FormLabel>স্ট্যাটাস</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">চলমান (Active)</SelectItem>
                        <SelectItem value="COMPLETED">সম্পন্ন (Completed)</SelectItem>
                        <SelectItem value="CANCELLED">বাতিল (Cancelled)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শুরুর তারিখ *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>শেষের তারিখ (ঐচ্ছিক)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>মন্তব্য</FormLabel>
                    <FormControl>
                      <Input placeholder="যেকোনো মন্তব্য (যদি থাকে)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/campaigns/manage")}>
                বাতিল করুন
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                সংরক্ষণ করুন
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
