"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { loanSchema, type LoanFormValues } from "../schema"
import { createLoanRequest, editLoanRequest } from "../actions"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Beneficiary } from "@prisma/client"
import { MemberCombobox } from "@/components/member-combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface LoanFormProps {
  beneficiaries: Beneficiary[]
  initialData?: LoanFormValues & { id: string }
}

export function LoanForm({ beneficiaries, initialData }: LoanFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const isEditMode = !!initialData

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema as any),
    defaultValues: initialData || {
      beneficiaryId: "",
      loanType: "OTHER", // Let's use OTHER as a default if not set
      amount: 0,
      purpose: "",
      businessType: "",
      notes: "",
    },
  })

  const watchedLoanType = form.watch("loanType")
  const watchedBeneficiaryId = form.watch("beneficiaryId")
  const selectedBeneficiary = beneficiaries.find(b => b.id === watchedBeneficiaryId)

  async function onSubmit(data: LoanFormValues) {
    setIsLoading(true)
    const result = isEditMode && initialData?.id
      ? await editLoanRequest(initialData.id, data)
      : await createLoanRequest(data)
    
    setIsLoading(false)

    if (result.success) {
      toast.success(isEditMode ? "ঋণ সফলভাবে সংশোধন করা হয়েছে!" : "নতুন ঋণ সফলভাবে তৈরি করা হয়েছে!")
      if (isEditMode && initialData?.id) {
        router.push(`/loans/${initialData.id}`)
      } else {
        router.push("/loans")
      }
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* ১. সুবিধাভোগী নির্বাচন */}
        <Card>
          <CardHeader>
            <CardTitle>১. সুবিধাভোগী নির্বাচন</CardTitle>
            <CardDescription>ঋণ গ্রহণের জন্য সুবিধাভোগী নির্বাচন করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>সুবিধাভোগী *</FormLabel>
                  <FormControl>
                    <MemberCombobox
                      members={beneficiaries}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedBeneficiary && (
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex gap-2"><span className="font-semibold w-32">নাম:</span> <span>{selectedBeneficiary.fullName}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">সুবিধাভোগী আইডি:</span> <span>{selectedBeneficiary.beneficiaryId || "-"}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">মোবাইল নম্বর:</span> <span>{selectedBeneficiary.phone || "-"}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ২. ঋণের তথ্য */}
        <Card>
          <CardHeader>
            <CardTitle>২. ঋণের তথ্য</CardTitle>
            <CardDescription>ঋণের পরিমাণ ও কারণ উল্লেখ করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>ঋণের কারণ *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="BUSINESS" />
                        </FormControl>
                        <FormLabel className="font-normal">ব্যবসা</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="OTHER" />
                        </FormControl>
                        <FormLabel className="font-normal">অন্যান্য</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchedLoanType === "BUSINESS" && (
                <>
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ব্যবসার ধরন *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="যেমন: মুদি দোকান, খামার" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ঋণ গ্রহণের উদ্দেশ্য *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="যেমন: মালামাল ক্রয়" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {watchedLoanType === "OTHER" && (
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>কারণ / Reason *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="যেমন: চিকিৎসা, শিক্ষা" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ঋণের পরিমাণ (৳) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? "" : v); }}
                      />
                    </FormControl>
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
                  <FormLabel>মন্তব্য (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            বাতিল করুন
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "প্রসেসিং..." : (isEditMode ? "সংরক্ষণ করুন" : "ঋণ আবেদন করুন")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
