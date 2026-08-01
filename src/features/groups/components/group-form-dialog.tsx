"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormValues } from "../schema"
import { createGroup, updateGroup } from "../actions"
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
import type { Group } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/i18n/LanguageProvider";

interface GroupFormDialogProps {
  group?: Group
  trigger?: React.ReactNode
}

export function GroupFormDialog({ group, trigger }: GroupFormDialogProps) {
    const { t } = useLanguage();
  const [open, setOpen] = useState(false)
  const isEditing = !!group

  const form = useForm<GroupFormValues>({
     
    resolver: zodResolver(groupSchema) as any,
    defaultValues: {
      name: group?.name || "",
      code: group?.code || "",
      shortName: group?.shortName || "",
      description: group?.description || "",
      status: (group?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
      openingBalance: 0,
      remarks: group?.remarks || "",
    },
  })

  async function onSubmit(data: GroupFormValues) {
    const res = isEditing
      ? await updateGroup(group.id, data)
      : await createGroup(data)

    if (res.success) {
      toast.success(isEditing ? t("groups.form.updateSuccess") : t("groups.form.success"))
      setOpen(false)
      form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t("groups.manage.newBtn")}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t("groups.table.actions.edit") : t("groups.manage.newBtn")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("groups.form.groupName")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("groups.form.placeholders.groupName")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("groups.form.groupCode")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={"G-001"} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("groups.form.description")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("groups.form.placeholders.description")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("groups.form.status")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={"Select Status"} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ACTIVE">{t("groups.table.status.active")}</SelectItem>
                                        <SelectItem value="INACTIVE">{t("groups.table.status.inactive")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                {t("groups.form.cancel")}</Button>
              <Button type="submit">{t("groups.form.save")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
