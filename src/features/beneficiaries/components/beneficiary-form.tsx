"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { beneficiarySchema, type BeneficiaryFormValues } from "../schema"
import { createBeneficiary } from "../actions"
import { Button } from "@/components/ui/button"
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
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface BeneficiaryFormProps {
  members?: any[] // kept for compatibility if needed elsewhere
}



export function BeneficiaryForm({ members }: BeneficiaryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [docPreview, setDocPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      fullName: "",
      fatherOrHusbandName: "",
      nationalId: "",
      mobile: "",
      presentAddress: "",
      permanentAddress: "",
      emergencyContactName: "",
      emergencyContactRelation: "",
      emergencyContactMobile: "",
      status: "ACTIVE",
    },
  })

  async function onSubmit(data: BeneficiaryFormValues) {
    setIsSubmitting(true)
    
    try {
      if (photoFile) {
        const formData = new FormData()
        formData.append("file", photoFile)
        formData.append("folder", "foundation/beneficiaries/photos")
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const json = await uploadRes.json()
          if (json.success) data.beneficiaryPhoto = json.secure_url
        } else {
          toast.error("Failed to upload photo")
          setIsSubmitting(false)
          return
        }
      }
      
      if (docFile) {
        const formData = new FormData()
        formData.append("file", docFile)
        formData.append("folder", "foundation/beneficiaries/docs")
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        if (uploadRes.ok) {
          const json = await uploadRes.json()
          if (json.success) data.nidOrBirthCertificate = json.secure_url
        } else {
          toast.error("Failed to upload document")
          setIsSubmitting(false)
          return
        }
      }
    } catch (error) {
      toast.error("Upload error")
      setIsSubmitting(false)
      return
    }

    const res = await createBeneficiary(data)
    setIsSubmitting(false)

    if (res.success) {
      toast.success("সুবিধাভোগী সফলভাবে নিবন্ধিত হয়েছে")
      router.push("/beneficiaries")
    } else {
      toast.error(res.error || "একটি ত্রুটি ঘটেছে")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (val: string) => void, setFile: (file: File) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-sm">
      <CardHeader className="text-center border-b bg-muted/20 pb-8 pt-8">
        <CardTitle className="text-2xl font-bold">সুবিধাভোগী নিবন্ধন ফরম</CardTitle>
        <CardDescription className="text-md mt-2">
          অনুগ্রহ করে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন। (*) চিহ্নিত ঘরগুলো পূরণ করা আবশ্যক।
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            
            {/* SECTION 1: ব্যক্তিগত তথ্য */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-1 bg-primary rounded-full"></div>
                <h3 className="text-xl font-semibold">১. ব্যক্তিগত তথ্য</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pl-3">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-base">১. পূর্ণ নাম <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="সুবিধাভোগীর পূর্ণ নাম" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherOrHusbandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">২. পিতা / স্বামীর নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="পিতা বা স্বামীর নাম" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">৩. জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর</FormLabel>
                      <FormControl>
                        <Input placeholder="NID বা জন্ম নিবন্ধন নম্বর" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-base">৪. মোবাইল নম্বর</FormLabel>
                      <FormControl>
                        <Input placeholder="১১ ডিজিটের মোবাইল নম্বর" className="h-11 md:w-1/2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="presentAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-base">৫. বর্তমান ঠিকানা</FormLabel>
                      <FormControl>
                        <Textarea placeholder="বিস্তারিত বর্তমান ঠিকানা..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="permanentAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="text-base">৬. স্থায়ী ঠিকানা</FormLabel>
                      <FormControl>
                        <Textarea placeholder="বিস্তারিত স্থায়ী ঠিকানা..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>



            {/* SECTION 2: জরুরি যোগাযোগ */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-1 bg-primary rounded-full"></div>
                <h3 className="text-xl font-semibold">২. জরুরি যোগাযোগ</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pl-3">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">১. নাম</FormLabel>
                      <FormControl>
                        <Input placeholder="যোগাযোগের ব্যক্তির নাম" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">২. সম্পর্ক</FormLabel>
                      <FormControl>
                        <Input placeholder="সুবিধাভোগীর সাথে সম্পর্ক" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">৩. মোবাইল নম্বর</FormLabel>
                      <FormControl>
                        <Input placeholder="মোবাইল নম্বর" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* SECTION 3: ডকুমেন্টসমূহ */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-1 bg-primary rounded-full"></div>
                <h3 className="text-xl font-semibold">৩. ডকুমেন্টসমূহ</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 pl-3">
                <div className="space-y-4">
                  <p className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">সুবিধাভোগীর ছবি</p>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-photo" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                      {photoPreview ? (
                        <div className="relative w-full h-full p-2">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                          <p className="text-xs text-muted-foreground">PNG, JPG</p>
                        </div>
                      )}
                      <input id="dropzone-photo" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoPreview, setPhotoFile)} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">জাতীয় পরিচয়পত্র অথবা জন্ম নিবন্ধন</p>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-doc" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                      {docPreview ? (
                        <div className="relative w-full h-full p-2">
                          <img src={docPreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, PDF</p>
                        </div>
                      )}
                      <input id="dropzone-doc" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, setDocPreview, setDocFile)} />
                    </label>
                  </div>
                </div>
              </div>
            </div>



            <div className="flex justify-end space-x-4 pt-8 print:hidden">
              <Button variant="outline" type="button" size="lg" className="w-32 text-base" onClick={() => router.push("/beneficiaries")}>
                বাতিল
              </Button>
              <Button type="submit" size="lg" className="w-40 text-base" disabled={isSubmitting}>
                {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
