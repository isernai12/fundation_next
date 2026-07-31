"use client"

import { useState, useEffect, useRef } from "react"
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
import type { Beneficiary, Document } from "@prisma/client"
import { MemberCombobox } from "@/components/member-combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/i18n/LanguageProvider";

interface LoanFormProps {
  beneficiaries: Beneficiary[]
  groups?: { id: string; name: string; currentFund?: number }[]
  initialData?: LoanFormValues & { id: string }
  initialDocuments?: Document[]
}

export function LoanForm({ beneficiaries, groups, initialData, initialDocuments = [] }: LoanFormProps) {
    const { t } = useLanguage();
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Documents State
  const [existingDocs, setExistingDocs] = useState<Document[]>(initialDocuments)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!initialData

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
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
      firstInstallmentDate: undefined,
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
        toast.success(t("loans.k_f96d37"))
        setExistingDocs(prev => prev.filter(d => d.id !== docId))
      } else {
        toast.error("ডকুমেন্ট মুছতে ব্যর্থ হয়েছে: " + res.error)
      }
    }
  }

  
  useEffect(() => {
    form.setValue("firstInstallmentDate", new Date())
  }, [form])

  async function onSubmit(data: LoanFormValues) {
    setIsLoading(true)
    const result = isEditMode && initialData?.id
      ? await editLoanRequest(initialData.id, data)
      : await createLoanRequest(data)
    
    setIsLoading(false)

    if (result.success) {
      const currentLoanId = isEditMode ? initialData?.id : (result.success && 'data' in result && result.data && typeof result.data === 'object' && 'id' in result.data ? String(result.data.id) : undefined)

      if (currentLoanId && pendingFiles.length > 0) {
        toast.info(t("loans.k_c49823"))
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
            <CardTitle>{t("loans.k_a183b1")}</CardTitle>
            <CardDescription>{t("loans.k_7e46f0")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("loans.k_1a8a5d")}</FormLabel>
                                <FormControl>
                                  <MemberCombobox
                                    members={beneficiaries}
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            {selectedBeneficiary && (
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex gap-2"><span className="font-semibold w-32">{t("loans.k_9d4717")}</span> <span>{selectedBeneficiary.fullName}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">{t("loans.k_9c72ba")}</span> <span>{selectedBeneficiary.beneficiaryId || "-"}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">{t("loans.k_1a1f1e")}</span> <span>{selectedBeneficiary.phone || "-"}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ২. ঋণের তথ্য */}
        <Card>
          <CardHeader>
            <CardTitle>{t("loans.k_7f3e49")}</CardTitle>
            <CardDescription>{t("loans.k_df8f89")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => {
                return ((
                              <FormItem className="space-y-3">
                                <FormLabel>{t("loans.k_5d5310")}</FormLabel>
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
                                      <FormLabel className="font-normal">{t("loans.k_dc2a97")}</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="OTHER" />
                                      </FormControl>
                                      <FormLabel className="font-normal">{t("loans.k_8f019f")}</FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchedLoanType === "BUSINESS" && (
                <>
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => {
                      return ((
                                          <FormItem>
                                            <FormLabel>{t("loans.k_6eeab3")}</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder={t("loans.k_8e9437")} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => {
                      return ((
                                          <FormItem>
                                            <FormLabel>{t("loans.k_ee6e42")}</FormLabel>
                                            <FormControl>
                                              <Input {...field} placeholder={t("loans.k_1f9448")} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        ));
                    }}
                  />
                </>
              )}

              {watchedLoanType === "OTHER" && (
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => {
                    return ((
                                      <FormItem>
                                        <FormLabel>{t("loans.reason_c172f0")}</FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder={t("loans.k_0c115b")} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    ));
                  }}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("loans.k_791764")}</FormLabel>
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
                                ));
                }}
              />
            </div>

            {/* Installment Schedule Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installmentType"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("loans.k_917edc")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("loans.k_426577")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="DAILY">{t("loans.k_0e4836")}</SelectItem>
                                        <SelectItem value="WEEKLY">{t("loans.k_d4f34e")}</SelectItem>
                                        <SelectItem value="MONTHLY">{t("loans.k_1788bf")}</SelectItem>
                                        <SelectItem value="CUSTOM">{t("loans.k_db09fd")}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="installmentAmount"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("loans.k_91c500")}</FormLabel>
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
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="totalInstallments"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("loans.k_8befe3")}</FormLabel>
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
                                ));
                }}
              />

              <FormField
                control={form.control}
                name="firstInstallmentDate"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("loans.k_7b319f")}</FormLabel>
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
                                ));
                }}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("loans.k_d44d54")}</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder={t("loans.k_5e1208")} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
          </CardContent>
        </Card>

        {/* ৪. ঋণের অর্থের উৎস */}
        <Card>
          <CardHeader>
            <CardTitle>{t("loans.funding_source_a41336")}</CardTitle>
            <CardDescription>{t("loans.k_d6e037")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isMultiGroup"
              render={({ field }) => {
                return ((
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
                                  <FormLabel>{t("loans.k_d662de")}</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    {t("loans.k_684437")}</p>
                                </div>
                              </FormItem>
                            ));
              }}
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
                        render={({ field: selectField }) => {
                          return ((
                                                  <FormItem>
                                                    <FormLabel>{t("loans.group_d4d811")}</FormLabel>
                                                    <Select onValueChange={selectField.onChange} defaultValue={selectField.value}>
                                                      <FormControl>
                                                        <SelectTrigger>
                                                          <SelectValue placeholder={t("loans.k_0a2922")} />
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
                                                ));
                        }}
                      />
                      {group && (
                        <div className="flex justify-between text-sm bg-muted p-2 rounded">
                          <div><span className="text-muted-foreground">{t("loans.available_balance_01cdd5")}</span> ৳{currentBalance}</div>
                          <div><span className="text-muted-foreground">{t("loans.remaining_after_loan_fcbbfd")}</span> <span className={remaining < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>৳{remaining}</span></div>
                        </div>
                      )}
                    </div>
                    <div className="w-1/3 mt-0">
                      <FormField
                        control={form.control}
                        name={`fundAllocations.${index}.amount`}
                        render={({ field: inputField }) => {
                          return ((
                                                  <FormItem>
                                                    <FormLabel>{t("loans.k_173a9f")}</FormLabel>
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
                                                ));
                        }}
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
                  {t("loans.k_224764")}</Button>
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
            <CardTitle>{t("loans.k_550a27")}</CardTitle>
            <CardDescription>{t("loans.pdf_jpg_png_7d9e99")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingDocs.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium">{t("loans.k_63988f")}</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {existingDocs.map((doc) => {
                    return ((
                                      <Card key={doc.id} className="relative overflow-hidden group">
                                        {doc.type === "IMAGE" ? (
                                          <div className="relative h-32 w-full bg-muted">
                                            <img src={doc.secureUrl} alt={doc.title} className="object-cover h-full w-full" />
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
                                              <a href={doc.secureUrl} target="_blank" rel="noreferrer">
                                                <Eye className="mr-2 h-4 w-4" /> {t("loans.k_cb4158")}</a>
                                            </Button>
                                            <Button type="button" variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteExistingDoc(doc.id)}>
                                              <Trash2 className="mr-2 h-4 w-4" /> {t("loans.k_047838")}</Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ));
                  })}
                </div>
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium">{t("loans.k_4474d3")}</h4>
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
                                <Eye className="mr-2 h-4 w-4" /> {t("loans.k_cb4158")}</Button>
                            )}
                            <Button type="button" variant="destructive" size="sm" className={previewUrl ? "w-full" : "w-full"} onClick={() => removePendingFile(idx)}>
                              <Trash2 className="mr-2 h-4 w-4" /> {t("loans.k_047838")}</Button>
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
              <p className="text-sm font-medium">{t("loans.k_97d873")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("loans.pdf_jpg_png_webp_mb_e8adfb")}</p>
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
            {t("loans.k_c94621")}</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "প্রসেসিং..." : (isEditMode ? "সংরক্ষণ করুন" : "ঋণ আবেদন করুন")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
