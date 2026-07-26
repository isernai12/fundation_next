"use client"
import { getNow } from "@/lib/date";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createCampaignContribution } from "../actions"
import { campaignContributionSchema, CampaignContributionFormValues } from "../schema"
import { Loader2 } from "lucide-react"

export function CampaignContributionForm({ 
  campaignId,
  campaigns,
  members
}: { 
  campaignId?: string;
  campaigns: { id: string; name: string }[];
  members: { id: string; fullName: string | null; memberId: string }[];
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<CampaignContributionFormValues>({
    resolver: zodResolver(campaignContributionSchema),
    defaultValues: {
      campaignId: campaignId || "",
      contributorType: "MEMBER",
      memberId: "",
      donorName: "",
      donorMobile: "",
      donorAddress: "",
      amount: 0,
      date: getNow().toLocaleDateString('en-CA'),
      remarks: "",
    },
  })

  async function onSubmit(data: CampaignContributionFormValues) {
    setLoading(true)
    const result = await createCampaignContribution(data)
    setLoading(false)

    if (result.success) {
      toast.success("তহবিল সফলভাবে সংগৃহীত হয়েছে")
      router.push(`/campaigns/${data.campaignId}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border mt-4">
      <CardHeader className="border-b mb-6 pb-4">
        <CardTitle className="text-xl font-bold">তহবিলে অর্থ গ্রহণ</CardTitle>
        <CardDescription>নতুন অনুদান বা চাঁদা রেকর্ড করুন</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>তহবিল নির্বাচন করুন *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="তহবিল নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaigns.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contributorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>প্রদানকারীর ধরন *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ধরন নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MEMBER">সদস্য (Member)</SelectItem>
                        <SelectItem value="DONOR">অনুদানদাতা (Non-Member Donor)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("contributorType") === "MEMBER" ? (
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>সদস্য *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="সদস্য নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.fullName} ({m.memberId})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">অনুদানদাতার তথ্য (Non-Member)</h4>
                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>নাম *</FormLabel>
                        <FormControl>
                          <Input placeholder="অনুদানদাতার পূর্ণ নাম" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="donorMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>মোবাইল নম্বর *</FormLabel>
                        <FormControl>
                          <Input placeholder="০১৭XXXXXXXX" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="donorAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ঠিকানা (ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input placeholder="ঠিকানা" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>পরিমাণ (টাকা) *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
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
                    <FormLabel>তারিখ *</FormLabel>
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
                    <FormLabel>মন্তব্য</FormLabel>
                    <FormControl>
                      <Input placeholder="মন্তব্য (ঐচ্ছিক)" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
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
