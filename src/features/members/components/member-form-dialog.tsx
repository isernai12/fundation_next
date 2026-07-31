"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { memberSchema, type MemberFormValues } from "../schema"
import { createMember, updateMember } from "../actions"
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
import type { Member, Group } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/i18n/LanguageProvider";

interface MemberFormDialogProps {
  member?: Member
  groups: Group[]
  trigger?: React.ReactNode
}

export function MemberFormDialog({ member, groups, trigger }: MemberFormDialogProps) {
    const { t } = useLanguage();
  const [open, setOpen] = useState(false)
  const isEditing = !!member

  let parsedReference = { name: "", mobile: "", relation: "" };
  try {
    if (member?.reference) {
      parsedReference = JSON.parse(member.reference);
    }
  } catch (e) {
    // Ignore parse error
  }

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      groupId: member?.groupId || "",
      fullName: member?.fullName || "",
      fatherName: member?.fatherName || "",
      motherName: member?.motherName || "",
      dob: member?.dob ? new Date(member.dob).toISOString().split('T')[0] : "",
      nationalId: member?.nationalId || "",
      occupation: member?.occupation || "",
      education: member?.education || "",
      presentAddress: member?.presentAddress || "",
      permanentAddress: member?.permanentAddress || "",
      mobile: member?.mobile || "",
      email: member?.email || "",
      bloodGroup: member?.bloodGroup || "",
      
      emergencyContactName: member?.emergencyContactName || "",
      emergencyContactMobile: member?.emergencyContactMobile || "",
      emergencyContactRelation: member?.emergencyContactRelation || "",
      
      referenceName: parsedReference.name || "",
      referenceMobile: parsedReference.mobile || "",
      referenceRelation: parsedReference.relation || "",
    },
  })

  async function onSubmit(data: MemberFormValues) {
    const res = isEditing
      ? await updateMember(member.id, data)
      : await createMember(data)

    if (res.success) {
      toast.success(isEditing ? t("members.messages.update_success") : t("members.messages.add_success"))
      setOpen(false)
      form.reset()
    } else {
      toast.error(res.error ? t(res.error) : "An error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t("members.dialog.create_member")}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Member" : "Create Member"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto px-1 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="groupId" render={({ field }) => {
                                return ((
                                                  <FormItem>
                                                    <FormLabel>{t("members.form.group")}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                      <FormControl>
                                                        <SelectTrigger>
                                                          <SelectValue placeholder={t("members.form.select_group")} />
                                                        </SelectTrigger>
                                                      </FormControl>
                                                      <SelectContent>
                                                        {groups.map(g => (
                                                          <SelectItem key={g.id} value={g.id}>{g.name} ({g.code})</SelectItem>
                                                        ))}
                                                      </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                  </FormItem>
                                                ));
                              }}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("members.form.personal_info")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.full_name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="fatherName" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.father_name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="motherName" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.mother_name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="dob" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.dob")}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="nationalId" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.nid")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="bloodGroup" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.blood_group")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="occupation" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.occupation")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="education" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.education")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("members.form.contact_info")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="mobile" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.mobile")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="email" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.email")}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="presentAddress" render={({ field }) => {
                                    return ((
                                                      <FormItem className="col-span-2"><FormLabel>{t("members.form.present_address")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="permanentAddress" render={({ field }) => {
                                    return ((
                                                      <FormItem className="col-span-2"><FormLabel>{t("members.form.permanent_address")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("members.form.emergency_contact")}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="emergencyContactName" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.name")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="emergencyContactMobile" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.mobile")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                  <FormField control={form.control} name="emergencyContactRelation" render={({ field }) => {
                                    return ((
                                                      <FormItem><FormLabel>{t("members.form.relation")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    ));
                                  }} />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  {t("members.form.cancel")}</Button>
                <Button type="submit">{t("members.form.save")}</Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
