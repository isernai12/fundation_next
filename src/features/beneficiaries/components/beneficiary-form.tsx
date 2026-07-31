"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, UploadCloud, X } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { beneficiarySchema, type BeneficiaryFormValues } from "../schema";
import { createBeneficiary, updateBeneficiary, deleteBeneficiaryDocument } from "../actions";
import type { Beneficiary } from "@prisma/client";
import { formatDate } from "@/lib/format";
import { useLanguage } from "@/i18n/LanguageProvider";

const SectionCard = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
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
                  <span className="sr-only">{t("beneficiaries.form.toggle")}</span>
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
    };

export function BeneficiaryForm({ 
  mode = "create", 
  beneficiaryId, 
  initialData,
  beneficiary
}: { 
  members?: any[], 
  mode?: "create" | "edit",
  beneficiaryId?: string,
  initialData?: Partial<BeneficiaryFormValues>,
  beneficiary?: any
}) {
    const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: true,
    section3: true,
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const nidFrontInputRef = useRef<HTMLInputElement>(null);
  const nidBackInputRef = useRef<HTMLInputElement>(null);
  const bcInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: initialData || {
      fullName: beneficiary?.fullName || "",
      fatherOrHusbandName: beneficiary?.fatherOrHusbandName || "",
      nationalId: beneficiary?.nationalId || "",
      mobile: beneficiary?.mobile || "",
      presentAddress: beneficiary?.presentAddress || "",
      permanentAddress: beneficiary?.permanentAddress || "",
      
      emergencyContactName: beneficiary?.emergencyContactName || "",
      emergencyContactRelation: beneficiary?.emergencyContactRelation || "",
      emergencyContactMobile: beneficiary?.emergencyContactMobile || "",
      
      status: beneficiary?.status || "ACTIVE",
      
      idDocumentType: beneficiary?.idDocumentType || "NID",
      photoBase64: "",
      signatureBase64: "",
      nidFrontBase64: "",
      nidBackBase64: "",
      birthCertificateBase64: "",
    },
  });

  const getDoc = (title: string) => beneficiary?.documents?.find((d: any) => d.title === title);
  
  const existingPhoto = getDoc("Beneficiary Photo")?.secureUrl || beneficiary?.beneficiaryPhoto;
  const existingSignature = getDoc("Signature")?.secureUrl;
  
  // Try to find exact titles, fallback to legacy if "NID Front" missing but legacy exists
  const legacyId = beneficiary?.nidOrBirthCertificate;
  const existingNidFront = getDoc("NID Front")?.secureUrl || (legacyId && form.watch("idDocumentType") === "NID" ? legacyId : null);
  const existingNidBack = getDoc("NID Back")?.secureUrl;
  const existingBC = getDoc("Birth Certificate")?.secureUrl || (legacyId && form.watch("idDocumentType") === "BIRTH_CERTIFICATE" ? legacyId : null);

  async function onSubmit(data: BeneficiaryFormValues) {
    setIsSubmitting(true);
    try {
      const res = mode === "edit" ? await updateBeneficiary(beneficiaryId!, data) : await createBeneficiary(data);
      if (res.success) {
        toast.success(mode === "edit" ? t("beneficiaries.messages.update_success") : t("beneficiaries.messages.create_success"));
        router.push("/beneficiaries");
      } else {
        toast.error(res.error || t("beneficiaries.messages.save_error"));
      }
    } catch (error) {
      toast.error(t("beneficiaries.messages.error_general"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof BeneficiaryFormValues
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue(field, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteDocument = async (title: string, fieldName: keyof BeneficiaryFormValues) => {
    if (!window.confirm(t("beneficiaries.messages.confirm_delete_doc"))) return;
    
    // Clear local form state
    form.setValue(fieldName, "");

    // If it's an existing document in edit mode, delete it via server action
    if (mode === "edit" && beneficiaryId) {
      try {
        const res = await deleteBeneficiaryDocument(beneficiaryId, title);
        if (res.success) {
          toast.success(t("beneficiaries.messages.doc_deleted"));
          router.refresh(); // Refresh page to get updated DB state
        } else {
          toast.error(res.error || t("beneficiaries.messages.delete_doc_error"));
        }
      } catch (e) {
        toast.error(t("beneficiaries.messages.error_general"));
      }
    }
  };

  const UploadBox = ({ 
    title, 
    subtext, 
    inputRef, 
    field, 
    existingUrl,
    dbTitle
  }: { 
    title: string; 
    subtext: string; 
    inputRef: React.RefObject<HTMLInputElement | null>;
    field: keyof BeneficiaryFormValues;
    existingUrl?: string | null;
    dbTitle: string;
  }) => {
    const watchVal = form.watch(field) as string;
    const docObj = getDoc(dbTitle);
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-base mb-2">{title}</h3>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={(e) => handleFileChange(e, field)}
        />
        
        {!watchVal && !existingUrl ? (
          <div 
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">{t("beneficiaries.form.upload_click")}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative border rounded-lg overflow-hidden h-48 w-full group bg-muted/10">
              <Image 
                src={watchVal || existingUrl!} 
                alt={t("beneficiaries.form.preview")} 
                fill 
                className="object-contain" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  {t("beneficiaries.form.replace")}</Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    return (handleDeleteDocument(dbTitle, field));
                  }}
                >
                  {t("beneficiaries.form.delete")}</Button>
              </div>
            </div>
            {!watchVal && existingUrl && docObj && (
              <div className="text-center text-xs text-muted-foreground">
                {t("beneficiaries.form.uploaded_on")}{formatDate(docObj.createdAt)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-24 max-w-5xl mx-auto space-y-6">
        
        {mode === "edit" && beneficiary && (
          <Card className="bg-muted/30">
            <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("beneficiaries.form.beneficiary_id")}</p>
                <p className="font-mono font-medium">{beneficiary.beneficiaryId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("beneficiaries.form.created_at")}</p>
                <p className="font-medium">{formatDate(beneficiary.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SECTION 1: ব্যক্তিগত তথ্য */}
        <SectionCard title={t("beneficiaries.form.personal_info")} isOpen={openSections.section1} onToggle={() => toggleSection("section1")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => {
                return ((
                              <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>{t("beneficiaries.form.full_name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.full_name_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="fatherOrHusbandName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("beneficiaries.form.father_husband_name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.father_husband_name_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="nationalId"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("beneficiaries.form.nid")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.nid_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => {
                return ((
                              <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>{t("beneficiaries.form.mobile")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.mobile_placeholder")} className="md:w-1/2" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="presentAddress"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("beneficiaries.form.present_address")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("beneficiaries.form.present_address_placeholder")} className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("beneficiaries.form.permanent_address")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("beneficiaries.form.permanent_address_placeholder")} className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
            </div>
          </div>
        </SectionCard>

        {/* SECTION 2: জরুরি যোগাযোগ */}
        <SectionCard title={t("beneficiaries.form.emergency_contact")} isOpen={openSections.section2} onToggle={() => toggleSection("section2")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("beneficiaries.form.contact_name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.contact_name_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="emergencyContactRelation"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("beneficiaries.form.relation")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.relation_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="emergencyContactMobile"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("beneficiaries.form.mobile")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("beneficiaries.form.mobile")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
          </div>
        </SectionCard>

        {/* SECTION 3: ডকুমেন্টস */}
        <SectionCard title={t("beneficiaries.form.documents")} isOpen={openSections.section3} onToggle={() => toggleSection("section3")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <UploadBox 
              title={t("beneficiaries.form.photo")} 
              subtext={t("beneficiaries.form.file_subtext")} 
              inputRef={photoInputRef} 
              field="photoBase64" 
              dbTitle="Beneficiary Photo"
              existingUrl={existingPhoto} 
            />
            
            <UploadBox 
              title={t("beneficiaries.form.signature")} 
              subtext={t("beneficiaries.form.file_subtext")} 
              inputRef={signatureInputRef} 
              field="signatureBase64" 
              dbTitle="Signature"
              existingUrl={existingSignature} 
            />

            <div className="md:col-span-2 border-t pt-6 mt-2">
              <FormField
                control={form.control}
                name="idDocumentType"
                render={({ field }) => {
                  return ((
                                  <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">{t("beneficiaries.form.id_doc_type")}</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={(val) => {
                                          field.onChange(val);
                                          // Optional: Clear corresponding unselected fields if user switches
                                        }}
                                        value={field.value}
                                        className="flex space-x-6 mt-2"
                                      >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="NID" />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                            {t("beneficiaries.form.id_nid")}</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="BIRTH_CERTIFICATE" />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                            {t("beneficiaries.form.id_birth_cert")}</FormLabel>
                                        </FormItem>
                                      </RadioGroup>
                                    </FormControl>
                                  </FormItem>
                                ));
                }}
              />
            </div>

            {form.watch("idDocumentType") === "NID" ? (
              <>
                <UploadBox 
                  title={t("beneficiaries.form.nid_front")} 
                  subtext={t("beneficiaries.form.file_subtext")} 
                  inputRef={nidFrontInputRef} 
                  field="nidFrontBase64" 
                  dbTitle="NID Front"
                  existingUrl={existingNidFront} 
                />
                <UploadBox 
                  title={t("beneficiaries.form.nid_back")} 
                  subtext={t("beneficiaries.form.file_subtext")} 
                  inputRef={nidBackInputRef} 
                  field="nidBackBase64" 
                  dbTitle="NID Back"
                  existingUrl={existingNidBack} 
                />
              </>
            ) : (
              <UploadBox 
                title={t("beneficiaries.form.id_birth_cert")} 
                subtext={t("beneficiaries.form.file_subtext")} 
                inputRef={bcInputRef} 
                field="birthCertificateBase64" 
                dbTitle="Birth Certificate"
                existingUrl={existingBC} 
              />
            )}

          </div>
        </SectionCard>

        {/* ACTIONS */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" type="button" onClick={() => router.push("/beneficiaries/manage")}>
            {t("beneficiaries.form.cancel")}</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("beneficiaries.form.saving") : t("beneficiaries.form.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
