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
import { GroupCombobox } from "@/components/group-combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/i18n/LanguageProvider";

interface LoanFormProps {
  beneficiaries: Beneficiary[]
  groups?: { id: string; name: string; code?: string; isFoundationGroup?: boolean; currentFund?: number }[]
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
    if (confirm(t("loans.form.confirmDelete"))) {
      const res = await deleteDocumentById(docId)
      if (res.success) {
        toast.success(t("loans.form.guarantorAddress"))
        setExistingDocs(prev => prev.filter(d => d.id !== docId))
      } else {
        toast.error(t("loans.form.docDeleteFailed") + res.error)
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
        toast.info(t("loans.form.summary"))
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

      toast.success(isEditMode ? t("loans.form.updateSuccess") : t("loans.form.success"))
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
            <CardTitle>{t("loans.form.steps.beneficiarySelection")}</CardTitle>
            <CardDescription>{t("loans.form.summaryDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("loans.form.beneficiary")}</FormLabel>
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
                <div className="flex gap-2"><span className="font-semibold w-32">{t("loans.form.beneficiary")}</span> <span>{selectedBeneficiary.fullName}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">ID</span> <span>{selectedBeneficiary.beneficiaryId || "-"}</span></div>
                <div className="flex gap-2"><span className="font-semibold w-32">{t("loans.summary.mobile")}</span> <span>{selectedBeneficiary.phone || "-"}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ২. ঋণের তথ্য */}
        <Card>
          <CardHeader>
            <CardTitle>{t("loans.form.steps.loanInfo")}</CardTitle>
            <CardDescription>{t("loans.form.summaryDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("loans.form.loanType")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("loans.form.loanType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUSINESS">{t("loans.form.purposes.business")}</SelectItem>
                      <SelectItem value="EDUCATION">{t("loans.form.purposes.education")}</SelectItem>
                      <SelectItem value="MEDICAL">{t("loans.form.purposes.medical")}</SelectItem>
                      <SelectItem value="AGRICULTURE">{t("loans.form.purposes.agriculture")}</SelectItem>
                      <SelectItem value="EMERGENCY">{t("loans.form.purposes.emergency")}</SelectItem>
                      <SelectItem value="HOUSING">{t("loans.form.purposes.housing")}</SelectItem>
                      <SelectItem value="OTHER">{t("loans.form.purposes.other")}</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <FormLabel>{t("loans.form.businessType")}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t("loans.form.businessTypePlaceholder")} />
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
                        <FormLabel>{t("loans.form.reason")}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t("loans.form.reasonPlaceholder")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {watchedLoanType !== "BUSINESS" && (
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("loans.form.reason")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("loans.form.reasonPlaceholder")} />
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
                    <FormLabel>{t("loans.form.amount")}</FormLabel>
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
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("loans.form.installmentType")}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t("loans.form.installmentType")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="DAILY">{t("loans.form.types.daily")}</SelectItem>
                                        <SelectItem value="WEEKLY">{t("loans.form.types.weekly")}</SelectItem>
                                        <SelectItem value="MONTHLY">{t("loans.form.types.monthly")}</SelectItem>
                                        <SelectItem value="CUSTOM">{t("loans.form.types.custom")}</SelectItem>
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
                                    <FormLabel>{t("loans.form.installmentAmount")}</FormLabel>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("loans.form.numberOfInstallments")}</FormLabel>
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
                    <FormLabel>{t("loans.form.firstInstallmentDate")}</FormLabel>
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
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("loans.form.remarks")}</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder={t("loans.form.remarksPlaceholder")} />
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
            <CardTitle>{t("loans.form.fundingSource")}</CardTitle>
            <CardDescription>{t("loans.form.selectFundingSource")}</CardDescription>
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
                    <FormLabel>{t("loans.form.fundingSource")}</FormLabel>
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
                            <FormLabel>{t("loans.form.group")}</FormLabel>
                            <FormControl>
                              <GroupCombobox
                                groups={(groups || []).map((g) => ({
                                  id: g.id,
                                  name: g.name,
                                  code: g.code || g.name.substring(0, 3).toUpperCase(),
                                  isFoundationGroup: g.isFoundationGroup,
                                }))}
                                value={selectField.value}
                                onChange={selectField.onChange}
                                placeholder={t("loans.form.selectFundingSource")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {group && (
                        <div className="flex justify-between text-sm bg-muted p-2 rounded">
                          <div><span className="text-muted-foreground">{t("loans.form.availableBalance")}</span> ৳{currentBalance}</div>
                          <div><span className="text-muted-foreground">{t("loans.form.remainingAfterLoan")}</span> <span className={remaining < 0 ? "text-red-500 font-bold" : "text-green-600 font-bold"}>৳{remaining}</span></div>
                        </div>
                      )}
                    </div>
                    <div className="w-1/3 mt-0">
                      <FormField
                        control={form.control}
                        name={`fundAllocations.${index}.amount`}
                        render={({ field: inputField }) => (
                          <FormItem>
                            <FormLabel>{t("loans.form.amount")}</FormLabel>
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
                  + {t("loans.form.group")}</Button>
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
            <CardTitle>{t("loans.form.documents")}</CardTitle>
            <CardDescription>{t("loans.form.documentsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingDocs.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium">{t("loans.form.existingDocs")}</h4>
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
                                                <Eye className="mr-2 h-4 w-4" /> {"View"}</a>
                                            </Button>
                                            <Button type="button" variant="destructive" size="sm" className="w-full" onClick={() => handleDeleteExistingDoc(doc.id)}>
                                              <Trash2 className="mr-2 h-4 w-4" /> {t("loans.form.removeDocument")}</Button>
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
                <h4 className="text-sm font-medium">{t("loans.form.newDocs")}</h4>
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
                                <Eye className="mr-2 h-4 w-4" /> {"View"}</Button>
                            )}
                            <Button type="button" variant="destructive" size="sm" className={previewUrl ? "w-full" : "w-full"} onClick={() => removePendingFile(idx)}>
                              <Trash2 className="mr-2 h-4 w-4" /> {t("loans.form.removeDocument")}</Button>
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
              <p className="text-sm font-medium">{t("loans.form.uploadDocument")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("loans.form.fileTypes")}</p>
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
            {t("loans.form.cancel")}</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("loans.form.processing") : (isEditMode ? t("loans.form.updateBtn") : t("loans.form.submitBtn"))}
          </Button>
        </div>
      </form>
    </Form>
  )
}
