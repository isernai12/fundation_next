"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { loanSchema, type LoanFormValues } from "../schema"
import { createLoanRequest, editLoanRequest } from "../actions"
import { uploadDocument, deleteDocumentById } from "@/features/documents/actions"
import { toast } from "sonner"
import { UploadCloud, FileText, Trash2, Eye, Download, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Beneficiary } from "@prisma/client"
import { MemberCombobox } from "@/components/member-combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface LoanFormProps {
  beneficiaries: Beneficiary[]
  groups?: any[]
  initialData?: LoanFormValues & { id: string }
  initialDocuments?: any[]
}

export function LoanForm({ beneficiaries, groups, initialData, initialDocuments = [] }: LoanFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Documents State
  const [existingDocs, setExistingDocs] = useState<any[]>(initialDocuments)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!initialData

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema as any),
    defaultValues: initialData || {
      beneficiaryId: "",
      loanType: "OTHER", // Let's use OTHER as a default if not set
      amount: 0,
      purpose: "",
      businessType: "",
      notes: "",
      installmentType: "MONTHLY",
      installmentAmount: 0,
      totalInstallments: 0,
      firstInstallmentDate: new Date(),
      isMultiGroup: false,
      fundAllocations: [{ groupId: "", amount: 0 }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fundAllocations"
  })

  const watchedLoanType = form.watch("loanType")
  const watchedBeneficiaryId = form.watch("beneficiaryId")
  const selectedBeneficiary = beneficiaries.find(b => b.id === watchedBeneficiaryId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPendingFiles(prev => [...prev, ...newFiles])
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingDoc = async (docId: string) => {
    if (confirm("আপনি কি নিশ্চিত যে এই ডকুমেন্টটি মুছে ফেলতে চান?")) {
      const res = await deleteDocumentById(docId)
      if (res.success) {
        toast.success("ডকুমেন্ট মুছে ফেলা হয়েছে")
        setExistingDocs(prev => prev.filter(d => d.id !== docId))
      } else {
        toast.error("ডকুমেন্ট মুছতে ব্যর্থ হয়েছে: " + res.error)
      }
    }
  }

  async function onSubmit(data: LoanFormValues) {
    setIsLoading(true)
    const result = isEditMode && initialData?.id
      ? await editLoanRequest(initialData.id, data)
      : await createLoanRequest(data)
    
    setIsLoading(false)

    if (result.success) {
      const currentLoanId = isEditMode ? initialData?.id : (result as any).data?.id

      if (currentLoanId && pendingFiles.length > 0) {
        toast.info("ডকুমেন্ট আপলোড করা হচ্ছে...")
        let uploadErrors = 0
        for (const file of pendingFiles) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("title", file.name)
          formData.append("targetType", "LOAN")
          formData.append("entityId", currentLoanId)
          
          const uploadRes = await uploadDocument(formData)
          if (!uploadRes.success) uploadErrors++
        }
        
        if (uploadErrors > 0) {
          toast.error(`${uploadErrors} টি ডকুমেন্ট আপলোড করতে সমস্যা হয়েছে।`)
        }
      }

      toast.success(isEditMode ? "ঋণ সফলভাবে সংশোধন করা হয়েছে!" : "নতুন ঋণ সফলভাবে তৈরি করা হয়েছে!")
      if (currentLoanId) {
        router.push(`/loans/${currentLoanId}`)
      } else {
        router.push("/loans")
      }
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* ১. সুবিধাভোগী নির্বাচন */}
        <Card>
          <CardHeader>
            <CardTitle>১. সুবিধাভোগী নির্বাচন</CardTitle>
            <CardDescription>ঋণ গ্রহণের জন্য সুবিধাভোগী নির্বাচন করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>সুবিধাভোগী *</FormLabel>
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
            {selectedBeneficiary && (
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex gap-2"><span className="font-semibold w-32">নাম:</span> <span>{selectedBeneficiary.fullName}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">সুবিধাভোগী আইডি:</span> <span>{selectedBeneficiary.beneficiaryId || "-"}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">মোবাইল নম্বর:</span> <span>{selectedBeneficiary.phone || "-"}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ২. ঋণের তথ্য */}
        <Card>
          <CardHeader>
            <CardTitle>২. ঋণের তথ্য</CardTitle>
            <CardDescription>ঋণের পরিমাণ ও কারণ উল্লেখ করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>ঋণের কারণ *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="BUSINESS" />
                        </FormControl>
                        <FormLabel className="font-normal">ব্যবসা</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="OTHER" />
                        </FormControl>
                        <FormLabel className="font-normal">অন্যান্য</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchedLoanType === "BUSINESS" && (
                <>
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ব্যবসার ধরন *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="যেমন: মুদি দোকান, খামার" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ঋণ গ্রহণের উদ্দেশ্য *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="যেমন: মালামাল ক্রয়" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {watchedLoanType === "OTHER" && (
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>কারণ / Reason *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="যেমন: চিকিৎসা, শিক্ষা" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ঋণের পরিমাণ (৳) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? "" : v); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Installment Schedule Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>কিস্তির ধরন</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="কিস্তির ধরন নির্বাচন করুন" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY">দৈনিক</SelectItem>
                        <SelectItem value="WEEKLY">সাপ্তাহিক</SelectItem>
                        <SelectItem value="MONTHLY">মাসিক</SelectItem>
                        <SelectItem value="CUSTOM">কাস্টম</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>কিস্তির পরিমাণ (৳)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? "" : v); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>মোট কিস্তির সংখ্যা</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? "" : v); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstInstallmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>প্রথম কিস্তির তারিখ</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                        onChange={e => { field.onChange(e.target.value ? new Date(e.target.value) : undefined); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মন্তব্য (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ৪. ঋণের অর্থের উৎস */}
        <Card>
          <CardHeader>
            <CardTitle>৪. ঋণের অর্থের উৎস (Funding Source)</CardTitle>
            <CardDescription>ঋণের জন্য ফান্ডের উৎস নির্বাচন করুন।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isMultiGroup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (!checked) {
                          // keep only the first element
                          if (fields.length > 1) {
                            form.setValue("fundAllocations", [form.getValues().fundAllocations[0]])
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>একাধিক গ্রুপ থেকে অর্থ প্রদান</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      একটি গ্রুপে পর্যাপ্ত ফান্ড না থাকলে একাধিক গ্রুপ ব্যবহার করুন।
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              {fields.map((field, index) => {
                const groupId = form.watch(`fundAllocations.${index}.groupId`)
                const group = groups?.find(g => g.id === groupId)
                const currentBalance = group?.currentFund || 0
                const allocAmount = form.watch(`fundAllocations.${index}.amount`) || 0
                const remaining = currentBalance - allocAmount

                return (
                  <div key={field.id} className="flex gap-4 items-start p-4 border rounded-md relative">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`fundAllocations.${index}.groupId`}
                        render={({ field: selectField }) => (
                          <FormItem>
                            <FormLabel>গ্রুপ (Group)</FormLabel>
                            <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="গ্রুপ নির্বাচন করুন" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {groups?.map(g => (
                                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {group && (
                        <div className="flex justify-between text-sm bg-muted p-2 rounded">
                          <div><span className="text-muted-foreground">Available Balance:</span> ৳{currentBalance}</div>
                          <div><span className="text-muted-foreground">Remaining After Loan:</span> <span className={remaining < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>৳{remaining}</span></div>
                        </div>
                      )}
                    </div>
                    <div className="w-1/3 mt-0">
                      <FormField
                        control={form.control}
                        name={`fundAllocations.${index}.amount`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormLabel>পরিমাণ (৳)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...inputField}
                                value={inputField.value ?? ""}
                                onChange={e => { const v = parseInt(e.target.value); inputField.onChange(isNaN(v) ? "" : v); }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.watch("isMultiGroup") && index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              })}
              {form.watch("isMultiGroup") && (
                <Button type="button" variant="outline" onClick={() => append({ groupId: "", amount: 0 })}>
                  + নতুন সারি যুক্ত করুন
                </Button>
              )}
              {form.formState.errors.fundAllocations?.root?.message && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.fundAllocations.root.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ৫. ডকুমেন্ট (ঐচ্ছিক) */}
        <Card>
          <CardHeader>
            <CardTitle>৫. ডকুমেন্ট (ঐচ্ছিক)</CardTitle>
            <CardDescription>প্রয়োজনীয় ফাইল আপলোড করুন (PDF, JPG, PNG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingDocs.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium">বিদ্যমান ডকুমেন্টস:</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {existingDocs.map((doc) => (
                    <Card key={doc.id} className="relative overflow-hidden group">
                      {doc.type === "IMAGE" ? (
                        <div className="relative h-32 w-full bg-muted">
                          <img src={doc.secureUrl || doc.url} alt={doc.title} className="object-cover h-full w-full" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 w-full bg-muted/50">
                          {doc.mimeType === "application/pdf" || doc.type === "PDF" ? (
                            <FileText className="h-12 w-12 text-destructive" />
                          ) : (
                            <FileText className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm truncate" title={doc.title}>{doc.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-2 space-y-3">
                        <Badge variant="secondary">{(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB</Badge>
                        
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                            <a href={doc.secureUrl || doc.url} target="_blank" rel="noreferrer">
                              <Eye className="mr-2 h-4 w-4" /> দেখুন
                            </a>
                          </Button>
                          <Button type="button" variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteExistingDoc(doc.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> মুছুন
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium">নতুন যোগ করা ডকুমেন্টস:</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingFiles.map((file, idx) => {
                    const isImage = file.type.startsWith("image/")
                    const previewUrl = isImage ? URL.createObjectURL(file) : null
                    
                    return (
                      <Card key={idx} className="relative overflow-hidden group">
                        {isImage && previewUrl ? (
                          <div className="relative h-32 w-full bg-muted">
                            <img src={previewUrl} alt={file.name} className="object-cover h-full w-full" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 w-full bg-muted/50">
                            {file.type === "application/pdf" ? (
                              <FileText className="h-12 w-12 text-destructive" />
                            ) : (
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <CardHeader className="p-3 pb-0">
                          <CardTitle className="text-sm truncate" title={file.name}>{file.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-2 space-y-3">
                          <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                          
                          <div className="flex space-x-2 pt-2 border-t">
                            {previewUrl && (
                              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => window.open(previewUrl, "_blank")}>
                                <Eye className="mr-2 h-4 w-4" /> দেখুন
                              </Button>
                            )}
                            <Button type="button" variant="destructive" size="sm" className={previewUrl ? "w-full" : "w-full"} onClick={() => removePendingFile(idx)}>
                              <Trash2 className="mr-2 h-4 w-4" /> মুছুন
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors"
                 onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">ডকুমেন্ট আপলোড করতে এখানে ক্লিক করুন</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, WEBP (সর্বোচ্চ ৫ MB)</p>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,image/jpeg,image/png,image/webp"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            বাতিল করুন
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "প্রসেসিং..." : (isEditMode ? "সংরক্ষণ করুন" : "ঋণ আবেদন করুন")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
