"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { beneficiarySchema, type BeneficiaryFormValues } from "../schema"
import { createBeneficiary, updateBeneficiary } from "../actions"
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
import { Beneficiary } from "@prisma/client"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BeneficiaryFormDialogProps {
  beneficiary?: Beneficiary
  members: { id: string; firstName: string | null; lastName: string | null; memberId: string }[]
  trigger?: React.ReactNode
}

export function BeneficiaryFormDialog({ beneficiary, members, trigger }: BeneficiaryFormDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      firstName: beneficiary?.firstName || "",
      lastName: beneficiary?.lastName || "",
      memberId: beneficiary?.memberId || "",
      relationToMember: beneficiary?.relationToMember || "",
      email: beneficiary?.email || "",
      phone: beneficiary?.phone || "",
      mobile: beneficiary?.mobile || "",
      address: beneficiary?.address || "",
      nationalId: beneficiary?.nationalId || "",
      occupation: beneficiary?.occupation || "",
      remarks: beneficiary?.remarks || "",
      status: beneficiary?.status || "ACTIVE",
    },
  })

  async function onSubmit(data: BeneficiaryFormValues) {
    const res = beneficiary 
      ? await updateBeneficiary(beneficiary.id, data)
      : await createBeneficiary(data)

    if (res.success) {
      toast.success(beneficiary ? "Beneficiary updated" : "Beneficiary created")
      setOpen(false)
      if (!beneficiary) form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New Beneficiary</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{beneficiary ? "Edit Beneficiary" : "Create Beneficiary"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="mobile" render={({ field }) => (
                  <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Alt Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nationalId" render={({ field }) => (
                  <FormItem><FormLabel>National ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="occupation" render={({ field }) => (
                  <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="memberId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Member (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Member" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.memberId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="relationToMember" render={({ field }) => (
                  <FormItem><FormLabel>Relation to Member</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="remarks" render={({ field }) => (
                <FormItem><FormLabel>Remarks</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
