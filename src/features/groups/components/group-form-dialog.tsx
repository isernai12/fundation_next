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
      toast.success(isEditing ? "Group updated" : "Group created")
      setOpen(false)
      form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t("groups.create_group_e3be07")}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Group" : "Create Group"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("groups.name_49ee30")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("groups.alpha_group_fb1484")} {...field} />
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
                                <FormLabel>{t("groups.code_ca0dba")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("groups.g_alpha_3caa0a")} {...field} />
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
                                <FormLabel>{t("groups.description_b5a7ad")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("groups.optional_description_d196d2")} {...field} />
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
                                    <FormLabel>{t("groups.status_ec53a8")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("groups.select_a_status_5ed7d8")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="ACTIVE">{t("groups.active_4d3d76")}</SelectItem>
                                        <SelectItem value="INACTIVE">{t("groups.inactive_3cab03")}</SelectItem>
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
                {t("groups.cancel_ea4788")}</Button>
              <Button type="submit">{t("groups.save_c9cc8c")}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
