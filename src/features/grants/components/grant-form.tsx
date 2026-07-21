"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createGrant } from "../actions"
import { grantSchema, type GrantFormValues } from "../schema"
import { Plus, Trash2 } from "lucide-react"
import { MemberCombobox } from "@/components/member-combobox"

export function GrantForm({ beneficiaries, groups }: { 
  beneficiaries: { id: string; beneficiaryId: string; fullName: string | null;  }[], 
  groups: { id: string; name: string; code: string }[] 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const defaultValues: Partial<GrantFormValues> = {
    beneficiaryId: "",
    grantDate: new Date().toISOString().split("T")[0],
    category: "",
    amount: 0,
    reason: "",
    approvedBy: "",
    referenceNumber: "",
    remarks: "",
    allocations: [{ groupId: "", amount: 0 }]
  }

  const form = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    name: "allocations",
    control: form.control,
  })

  const currentAmount = form.watch("amount")
  const currentAllocations = form.watch("allocations")
  const totalAllocated = currentAllocations.reduce((sum, a) => sum + (a.amount || 0), 0)

  async function onSubmit(data: GrantFormValues) {
    setLoading(true)
    const res = await createGrant(data)
    if (res.success) {
      toast.success("Grant processed and disbursed successfully")
      router.push("/grants")
    } else {
      toast.error(res.error || "Failed to process grant")
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* SECTION 1: Beneficiary */}
        <Card>
          <CardHeader>
            <CardTitle>Section 1: Beneficiary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Beneficiary</FormLabel>
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
          </CardContent>
        </Card>

        {/* SECTION 2: Grant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Section 2: Grant Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="grantDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grant Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grant Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Marriage">Marriage</SelectItem>
                      <SelectItem value="Business Support">Business Support</SelectItem>
                      <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
                  <FormLabel>Total Grant Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? "" : v); }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Reason & Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explain why this grant is being provided..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 3: Funding Source */}
        <Card>
          <CardHeader>
            <CardTitle>Section 3: Funding Source</CardTitle>
            <CardDescription>
              Allocate funding from one or multiple groups. Total allocation must equal the Grant Amount (${currentAmount || 0}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name={`allocations.${index}.groupId`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Funding Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.code} - {g.name}
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
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Contribution Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? "" : v); }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            
            <div className="flex items-center justify-between mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => append({ groupId: "", amount: 0 })}>
                <Plus className="mr-2 h-4 w-4" /> Add Another Group
              </Button>
              
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">Total Allocated:</span>
                <span className={`font-bold ${totalAllocated !== currentAmount ? 'text-destructive' : 'text-primary'}`}>
                  ${totalAllocated.toFixed(2)} / ${currentAmount.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Display root errors for allocations if any */}
            {form.formState.errors.allocations?.root && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.allocations.root.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* SECTION 4: Approval */}
        <Card>
          <CardHeader>
            <CardTitle>Section 4: Approval</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="approvedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved By</FormLabel>
                  <FormControl>
                    <Input placeholder="Approving Authority" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Approval Memo / Resolution No" {...field} />
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
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any internal notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SECTION 5: Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Section 5: Documents</CardTitle>
            <CardDescription>
              Documents can be attached to this grant from the &quot;Grant Documents&quot; tab after creation.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset Form
          </Button>
          <Button type="submit" disabled={loading || totalAllocated !== currentAmount}>
            {loading ? "Processing..." : "Disburse Grant"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
