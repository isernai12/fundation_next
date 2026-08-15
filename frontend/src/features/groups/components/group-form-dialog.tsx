"use client"

import { useState, useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { groupSchema, type GroupFormValues } from "../schema"
import { createGroup, updateGroup } from "../actions"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
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
import type { GroupWithCount } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/i18n/LanguageProvider";

import { Switch } from "@/components/ui/switch"
import { FormDescription } from "@/components/ui/form"

interface GroupFormDialogProps {
  group?: Group | GroupWithCount
  trigger?: React.ReactNode
}

export function GroupFormDialog({ group, trigger }: GroupFormDialogProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!group

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema) as Resolver<GroupFormValues>,
    defaultValues: {
      name: group?.name || "",
      code: group?.code || "",
      shortName: group?.shortName || "",
      description: group?.description || "",
      status: (group?.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
      openingBalance: 0,
      remarks: group?.remarks || "",
      memberSignupEnabled: group?.memberSignupEnabled ?? true,
      isFoundationGroup: group?.isFoundationGroup ?? false,
    },
  })

  useEffect(() => {
    if (!isEditing && open && !form.getValues("code")) {
      form.setValue("code", "G-" + Math.floor(1000 + Math.random() * 9000))
    }
  }, [isEditing, open, form])

  async function onSubmit(data: GroupFormValues) {
    setIsSubmitting(true)
    try {
      const res = isEditing
        ? await updateGroup(group.id, data)
        : await createGroup(data)

      if (res.success) {
        toast.success(isEditing ? t("groups.form.updateSuccess") : t("groups.form.success"))
        setOpen(false)
        form.reset()
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save group")
    } finally {
      setIsSubmitting(false)
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

            <FormField
              control={form.control}
              name="memberSignupEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5 pr-2">
                    <FormLabel className="text-sm font-semibold">
                      Allow Member Signup (সদস্য নিবন্ধন)
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      Enable or disable member registration for this group.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={group?.isFoundationGroup || form.watch("isFoundationGroup")}
                    />
                  </FormControl>
                </FormItem>
              )}
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("groups.form.saving") : t("groups.form.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
