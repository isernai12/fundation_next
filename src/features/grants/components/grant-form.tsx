"use client"
import { getNow } from "@/lib/date";

import { useState, useEffect, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronDown, ChevronUp, UploadCloud, X, FileText, Trash2, Plus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { createGrant, updateGrant } from "../actions"
import { grantSchema, type GrantFormValues } from "../schema"
import { uploadDocument, deleteDocumentById } from "@/features/documents/actions"
import { MemberCombobox } from "@/components/member-combobox"
import { GroupCombobox } from "@/components/group-combobox"
import { useLanguage } from "@/i18n/LanguageProvider";

const SectionCard = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) => {
      const { t } = useLanguage();
      return ((
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <Card className="mb-6 shadow-sm border-muted">
          <CardHeader className="py-4 border-b bg-muted/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="w-9 p-0 hover:bg-transparent">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">{t("grants.k_7b5f74")}</span>
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-6">{children}</CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    ));
    }

export function GrantForm({ 
  beneficiaries, 
  groups,
  initialData,
  initialDocuments = [],
  grantId
}: { 
  beneficiaries: { id: string; beneficiaryId: string; fullName: string | null;  }[]
  groups: { id: string; name: string; code: string }[]
  initialData?: Partial<GrantFormValues>
  initialDocuments?: any[]
  grantId?: string
}) {
    const { t } = useLanguage();
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!grantId

  // Sections State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: true,
    section3: true,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Documents State
  const [existingDocs, setExistingDocs] = useState<any[]>(initialDocuments)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultValues: Partial<GrantFormValues> = initialData || {
    beneficiaryId: "",
    grantDate: "",
    amount: 0,
    grantReason: "",
    comment: "",
    allocations: [{ groupId: "", amount: 0 }]
  }

  const form = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema as any),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    name: "allocations",
    control: form.control,
  })

  const rawAmount = form.watch("amount")
  const currentAmount = Number(rawAmount) || 0
  const currentAllocations = form.watch("allocations")
  const totalAllocated = currentAllocations.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)

  // Document Handlers
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
        toast.success(t("grants.k_f96d37"))
        setExistingDocs(prev => prev.filter(d => d.id !== docId))
      } else {
        toast.error("ডকুমেন্ট মুছতে ব্যর্থ হয়েছে: " + res.error)
      }
    }
  }

  
  useEffect(() => {
    form.setValue("grantDate", getNow().toLocaleDateString('en-CA'))
  }, [form])

  async function onSubmit(data: GrantFormValues) {
    setLoading(true)
    let res;
    if (isEditing) {
      res = await updateGrant(grantId, data)
    } else {
      res = await createGrant(data)
    }
    
    if (res.success) {
      const currentGrantId = isEditing ? grantId : (res as any).data?.id
      
      // Upload pending files if any
      if (currentGrantId && pendingFiles.length > 0) {
        toast.info(t("grants.k_c49823"))
        let uploadErrors = 0
        for (const file of pendingFiles) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("title", file.name)
          formData.append("targetType", "GRANT")
          formData.append("entityId", currentGrantId)
          
          const uploadRes = await uploadDocument(formData)
          if (!uploadRes.success) uploadErrors++
        }
        
        if (uploadErrors > 0) {
          toast.error(`${uploadErrors} টি ডকুমেন্ট আপলোড করতে সমস্যা হয়েছে।`)
        }
      }

      toast.success(isEditing ? "অনুদান সফলভাবে আপডেট করা হয়েছে" : "অনুদান সফলভাবে তৈরি করা হয়েছে")
      router.push(`/grants/${currentGrantId || ""}`)
    } else {
      toast.error(res.error || "অনুদান প্রক্রিয়াকরণে ব্যর্থ হয়েছে")
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-24 max-w-5xl mx-auto space-y-6">
        
        {/* SECTION 1: Beneficiary */}
        <SectionCard title={t("grants.k_a183b1")} isOpen={openSections.section1} onToggle={() => toggleSection("section1")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("grants.k_316bb4")}</FormLabel>
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
          </div>
        </SectionCard>

        {/* SECTION 2: Grant Information */}
        <SectionCard title={t("grants.k_57ca99")} isOpen={openSections.section2} onToggle={() => toggleSection("section2")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="grantDate"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("grants.k_3e10c2")}</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("grants.k_30fc04")}</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? "" : v); }} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="grantReason"
              render={({ field }) => {
                return ((
                              <FormItem className="md:col-span-2">
                                <FormLabel>{t("grants.k_5660ba")}</FormLabel>
                                <FormControl>
                                  <Textarea placeholder={t("grants.k_0a5c6b")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => {
                return ((
                              <FormItem className="md:col-span-2">
                                <FormLabel>{t("grants.k_d44d54")}</FormLabel>
                                <FormControl>
                                  <Textarea placeholder={t("grants.k_8f9d58")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />

            <div className="md:col-span-2 mt-4">
              <h4 className="text-sm font-medium mb-3">{t("grants.funding_sources_8c4d29")}</h4>
              <div className="space-y-4">
                {fields.map((field, index) => {
                  return ((
                                  <div key={field.id} className="flex flex-col sm:flex-row items-end gap-4 p-4 border rounded-md bg-muted/5">
                                    <FormField
                                      control={form.control}
                                      name={`allocations.${index}.groupId`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1 w-full">
                                          <FormLabel>{t("grants.k_04c895")}</FormLabel>
                                          <FormControl>
                                            <GroupCombobox
                                              groups={groups}
                                              value={field.value}
                                              onChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`allocations.${index}.amount`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1 w-full">
                                          <FormLabel>{t("grants.k_173a9f")}</FormLabel>
                                          <FormControl>
                                            <Input type="number" step="0.01" {...field} value={field.value ?? ""} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? "" : v); }} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      className="mt-2 sm:mt-0"
                                      onClick={() => remove(index)}
                                      disabled={fields.length === 1}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ));
                })}
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ groupId: "", amount: 0 })}>
                    <Plus className="mr-2 h-4 w-4" /> {t("grants.k_0fc994")}</Button>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground mr-2">{t("grants.k_545972")}</span>
                    <span className={`font-bold ${totalAllocated !== currentAmount ? 'text-destructive' : 'text-primary'}`}>
                      ৳{totalAllocated.toFixed(2)} {t("grants.k_b2e71d")}{currentAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {form.formState.errors.allocations?.root && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.allocations.root.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* SECTION 3: Documents */}
        <SectionCard title={t("grants.k_e17831")} isOpen={openSections.section3} onToggle={() => toggleSection("section3")}>
          <div className="space-y-4">
            
            {/* Existing Documents List */}
            {existingDocs.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium">{t("grants.k_63988f")}</h4>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {existingDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded bg-muted/20">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm truncate hover:underline" title={doc.title}>
                          {doc.title}
                        </a>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteExistingDoc(doc.id)} className="h-6 w-6 p-0 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Files List */}
            {pendingFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-medium">{t("grants.k_6099da")}</h4>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {pendingFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded bg-primary/5 border-primary/20">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm truncate" title={file.name}>{file.name}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePendingFile(idx)} className="h-6 w-6 p-0 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors"
                 onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{t("grants.k_97d873")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("grants.pdf_jpg_png_webp_mb_e8adfb")}</p>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,image/jpeg,image/png,image/webp"
              />
            </div>
            
          </div>
        </SectionCard>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" type="button" onClick={() => router.push("/grants/manage")}>
            {t("grants.k_de9b04")}</Button>
          <Button type="submit" disabled={loading || totalAllocated !== currentAmount}>
            {loading ? "সংরক্ষণ করা হচ্ছে..." : (isEditing ? "আপডেট করুন" : "সংরক্ষণ")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
