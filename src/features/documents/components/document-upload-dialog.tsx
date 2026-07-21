"use client"

import { useState } from "react"
import { uploadDocument } from "../actions"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadCloud } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface DocumentUploadDialogProps {
  targetType: "MEMBER" | "BENEFICIARY" | "LOAN" | "GRANT" | "FOUNDATION" | "GROUP"
  entityId: string
  categories: Category[]
  trigger?: React.ReactNode
}

export function DocumentUploadDialog({ targetType, entityId, categories, trigger }: DocumentUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) return toast.error("দয়া করে একটি ফাইল নির্বাচন করুন")
    if (!title) return toast.error("দয়া করে একটি শিরোনাম প্রদান করুন")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("categoryId", categoryId === "none" ? "" : categoryId)
    formData.append("targetType", targetType)
    formData.append("entityId", entityId)
    formData.append("description", description)
    formData.append("remarks", remarks)

    setIsUploading(true)
    try {
      const res = await uploadDocument(formData)
      if (res.success) {
        toast.success("ডকুমেন্ট সফলভাবে আপলোড করা হয়েছে")
        setOpen(false)
        setFile(null)
        setTitle("")
        setCategoryId("")
        setDescription("")
        setRemarks("")
      } else {
        toast.error((res as any).error)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button><UploadCloud className="mr-2 h-4 w-4" /> ডকুমেন্ট আপলোড</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ডকুমেন্ট আপলোড</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>ফাইল (PDF, JPG, PNG, WEBP - সর্বোচ্চ ৫ MB)</Label>
            <Input 
              type="file" 
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="space-y-2">
            <Label>ডকুমেন্টের শিরোনাম *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>বিভাগ</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="বিভাগ নির্বাচন করুন" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">কোনটি নয়</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>বিবরণ</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>মন্তব্য</Label>
            <Input value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button type="submit" disabled={isUploading}>{isUploading ? "আপলোড হচ্ছে..." : "আপলোড"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
