"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loanSchema, type LoanFormValues } from "../schema"
import { createFullLoan } from "../actions"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Beneficiary, Fund, Group } from "@prisma/client"
import { Trash2, Plus } from "lucide-react"

interface LoanFormProps {
  beneficiaries: Beneficiary[]
  funds: (Fund & { group: Group | null })[]
}

export function LoanForm({ beneficiaries, funds }: LoanFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      beneficiaryId: "",
      amount: 0,
      purpose: "",
      installmentCount: 1,
      notes: "",
      allocations: [{ fundId: "", amount: 0 }],
      dateApproved: new Date(),
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allocations",
  })

  const watchedAmount = form.watch("amount")
  const watchedInstallmentCount = form.watch("installmentCount")
  const watchedAllocations = form.watch("allocations")

  const totalAllocated = watchedAllocations.reduce((sum, a) => sum + (a.amount || 0), 0)
  const installmentAmount = watchedAmount && watchedInstallmentCount ? Math.floor(watchedAmount / watchedInstallmentCount) : 0

  async function onSubmit(data: LoanFormValues) {
    if (totalAllocated !== data.amount) {
      toast.error(`Total allocated (${totalAllocated}) must equal loan amount (${data.amount})`)
      return
    }

    setIsLoading(true)
    const result = await createFullLoan(data)
    setIsLoading(false)

    if (result.success) {
      toast.success("Loan created, approved and disbursed successfully!")
      router.push("/loans")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* 1. Beneficiary */}
        <Card>
          <CardHeader>
            <CardTitle>1. Beneficiary</CardTitle>
            <CardDescription>Select the beneficiary receiving the loan.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiary</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a beneficiary" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {beneficiaries.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.fullName || 'নাম পাওয়া যায়নি'} </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 2. Loan Info */}
        <Card>
          <CardHeader>
            <CardTitle>2. Loan Info</CardTitle>
            <CardDescription>Enter the loan details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
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
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Education, Medical" />
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Any additional notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 3. Funding Source */}
        <Card>
          <CardHeader>
            <CardTitle>3. Funding Source</CardTitle>
            <CardDescription>Allocate funds from single or multi-group sources. Total must equal loan amount ({watchedAmount || 0}). Total Allocated: {totalAllocated}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`allocations.${index}.fundId`}
                  render={({ field: f }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Fund</FormLabel>
                      <Select onValueChange={f.onChange} defaultValue={f.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a fund" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {funds.map(fund => (
                            <SelectItem key={fund.id} value={fund.id}>
                              {fund.group ? `${fund.group.name} (${fund.name})` : fund.name}
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
                  name={`allocations.${index}.amount`}
                  render={({ field: f }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...f}
                          onChange={e => f.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ fundId: "", amount: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Funding Source
            </Button>
          </CardContent>
        </Card>

        {/* 4. Repayment Plan */}
        <Card>
          <CardHeader>
            <CardTitle>4. Repayment Plan (0% Interest)</CardTitle>
            <CardDescription>Set the number of installments. The system will calculate monthly payments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="installmentCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Monthly Installments</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedAmount > 0 && watchedInstallmentCount > 0 && (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium">Estimated Installment Details:</p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Total Amount: {watchedAmount}</li>
                  <li>Number of Installments: {watchedInstallmentCount}</li>
                  <li>Installment Amount: ~{installmentAmount} / month</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Approval & Documents are simplified since it auto-approves and disburses */}
        <Card>
          <CardHeader>
            <CardTitle>5. Approval & Submission</CardTitle>
            <CardDescription>Saving this will create the loan, allocate funds, reduce group funds in ledger, and mark as active.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="submit" disabled={isLoading || totalAllocated !== watchedAmount}>
              {isLoading ? "Processing..." : "Create & Disburse Loan"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
