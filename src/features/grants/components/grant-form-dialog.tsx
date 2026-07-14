"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { grantSchema, type GrantFormValues } from "../schema"
import { createGrantRequest } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GrantFormDialogProps {
  beneficiaries: { id: string; firstName: string; lastName: string; beneficiaryId: string }[]
  trigger?: React.ReactNode
}

export function GrantFormDialog({ beneficiaries, trigger }: GrantFormDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues: {
      beneficiaryId: "",
      amount: 500,
      purpose: "",
      notes: "",
    },
  })

  async function onSubmit(data: GrantFormValues) {
    const submitData = { ...data, amount: data.amount * 100 }
    
    const res = await createGrantRequest(submitData)

    if (res.success) {
      toast.success("Grant request created successfully!")
      setOpen(false)
      form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New Grant Request</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Grant Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="beneficiaryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiary</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select beneficiary" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {beneficiaries.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.firstName} {b.lastName} ({b.beneficiaryId})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>Grant Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="purpose" render={({ field }) => (
              <FormItem><FormLabel>Purpose</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
