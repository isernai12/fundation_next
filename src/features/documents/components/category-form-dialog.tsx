"use client"

import { useState } from "react"
import { createDocumentCategory } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

export function CategoryFormDialog({ trigger }: { trigger?: React.ReactNode }) {
    const { t } = useLanguage();
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name) return toast.error(t("documents.category_name_is_req_578b98"))

    try {
      const res = await createDocumentCategory(name, description)
      if (res.success) {
        toast.success(t("documents.category_created_suc_377e3c"))
        setOpen(false)
        setName("")
        setDescription("")
      } else {
        toast.error((res as any).error)
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button><Plus className="mr-2 h-4 w-4" /> {t("documents.new_category_4223df")}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("documents.create_document_cate_b8a470")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{t("documents.category_name_8e805e")}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>{t("documents.description_b5a7ad")}</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>{t("documents.cancel_ea4788")}</Button>
            <Button type="submit">{t("documents.create_686e69")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
