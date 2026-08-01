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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { memberSchema, type MemberFormValues } from "../schema";
import { createMember, updateMember, deleteMemberDocument } from "../actions";
import type { Member } from "@prisma/client";
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
                  <span className="sr-only">{t("members.common.toggle")}</span>
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

export function MemberForm({ 
  groups, 
  mode = "create", 
  memberId, 
  initialData,
  member
}: { 
  groups: any[], 
  mode?: "create" | "edit",
  memberId?: string,
  initialData?: Partial<MemberFormValues>,
  member?: any
}) {
    const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    section1: true,
    section2: true,
    section3: true,
    section4: true,
    section5: true,
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const nidFrontInputRef = useRef<HTMLInputElement>(null);
  const nidBackInputRef = useRef<HTMLInputElement>(null);
  const bcInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  let parsedReference = { name: "", mobile: "", relation: "" };
  try {
    if (member?.reference) {
      parsedReference = JSON.parse(member.reference);
    }
  } catch (e) {}

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData || {
      groupId: member?.groupId || "",
      fullName: member?.fullName || "",
      fatherName: member?.fatherName || "",
      motherName: member?.motherName || "",
      dob: member?.dob ? new Date(member.dob).toISOString().split('T')[0] : "",
      nationalId: member?.nationalId || "",
      occupation: member?.occupation || "",
      education: member?.education || "",
      presentAddress: member?.presentAddress || "",
      permanentAddress: member?.permanentAddress || "",
      mobile: member?.mobile || "",
      email: member?.email || "",
      bloodGroup: member?.bloodGroup || "",
      
      emergencyContactName: member?.emergencyContactName || "",
      emergencyContactMobile: member?.emergencyContactMobile || "",
      emergencyContactRelation: member?.emergencyContactRelation || "",
      
      referenceName: parsedReference.name || "",
      referenceMobile: parsedReference.mobile || "",
      referenceRelation: parsedReference.relation || "",
      
      idDocumentType: member?.idDocumentType || "NID",
      photoBase64: "",
      signatureBase64: "",
      nidFrontBase64: "",
      nidBackBase64: "",
      birthCertificateBase64: "",
    },
  });

  const getDoc = (title: string) => member?.documents?.find((d: any) => d.title === title);
  
  const existingPhoto = getDoc("Member Photo")?.secureUrl;
  const existingSignature = getDoc("Signature")?.secureUrl;
  const existingNidFront = getDoc("NID Front")?.secureUrl || (getDoc("National ID")?.secureUrl && form.watch("idDocumentType") === "NID" ? getDoc("National ID")?.secureUrl : null);
  const existingNidBack = getDoc("NID Back")?.secureUrl;
  const existingBC = getDoc("Birth Certificate")?.secureUrl;

  async function onSubmit(data: MemberFormValues) {
    setIsSubmitting(true);
    try {
      const res = mode === "edit" ? await updateMember(memberId!, data) : await createMember(data);
      if (res.success) {
        toast.success(mode === "edit" ? t("members.messages.update_success") : t("members.messages.add_success"));
        router.push("/members/manage");
      } else {
        toast.error(res.error ? t(res.error) : t("members.messages.save_error"));
      }
    } catch (error) {
      toast.error(t("members.messages.unexpected_error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof MemberFormValues
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

  const handleDeleteDocument = async (title: string, fieldName: keyof MemberFormValues) => {
    if (!window.confirm(t("members.messages.delete_confirm"))) return;
    
    // Clear local form state
    form.setValue(fieldName, "");

    // If it's an existing document in edit mode, delete it via server action
    if (mode === "edit" && memberId) {
      try {
        const res = await deleteMemberDocument(memberId, title);
        if (res.success) {
          toast.success(t("members.messages.delete_success"));
          router.refresh(); // Refresh page to get updated DB state
        } else {
          toast.error(res.error ? t(res.error) : t("members.messages.delete_error"));
        }
      } catch (e) {
        toast.error(t("members.messages.unexpected_error"));
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
    field: keyof MemberFormValues;
    existingUrl?: string | null;
    dbTitle: string;
  }) => {
    const watchVal = form.watch(field) as string;
    const docObj = getDoc(dbTitle) || (dbTitle === "NID Front" && getDoc("National ID"));
    
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
            <p className="text-sm font-medium">{t("members.documents.upload_helper")}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative border rounded-lg overflow-hidden h-48 w-full group bg-muted/10">
              <Image 
                src={watchVal || existingUrl!} 
                alt={t("members.documents.preview")} 
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
                  {t("members.documents.replace")}</Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    return (handleDeleteDocument(dbTitle, field));
                  }}
                >
                  {t("members.documents.delete")}</Button>
              </div>
            </div>
            {!watchVal && existingUrl && docObj && (
              <div className="text-center text-xs text-muted-foreground">
                {t("members.documents.uploaded_on")}{formatDate(docObj.createdAt)}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FormField
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">{t("members.edit_header.member_id") || "Member ID"}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. MBR-2026-0001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joinDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">{t("members.edit_header.join_date") || "Joining Date"}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => {
              return ((
                          <FormItem>
                            <FormLabel className="text-lg">{t("members.group_selector.label")}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={t("members.group_selector.placeholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {groups.map((g) => (
                                  <SelectItem key={g.id} value={g.id}>
                                    {g.name} ({g.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        ));
            }}
          />
        </div>

        {/* SECTION 1: ব্যক্তিগত তথ্য */}
        <SectionCard title={t("members.personal_info.section_title")} isOpen={openSections.section1} onToggle={() => toggleSection("section1")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.full_name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.full_name_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="fatherName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.father_name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.father_name")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="motherName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.mother_name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.mother_name")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.dob")}</FormLabel>
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
              name="nationalId"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.national_id_bc")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.national_id_bc_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.occupation")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.occupation_placeholder")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.education")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.education")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.blood_group")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("members.personal_info.blood_group_placeholder")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="A+">{"A+"}</SelectItem>
                                    <SelectItem value="A-">{"A-"}</SelectItem>
                                    <SelectItem value="B+">{"B+"}</SelectItem>
                                    <SelectItem value="B-">{"B-"}</SelectItem>
                                    <SelectItem value="AB+">{"AB+"}</SelectItem>
                                    <SelectItem value="AB-">{"AB-"}</SelectItem>
                                    <SelectItem value="O+">{"O+"}</SelectItem>
                                    <SelectItem value="O-">{"O-"}</SelectItem>
                                  </SelectContent>
                                </Select>
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
                              <FormItem>
                                <FormLabel>{t("members.personal_info.mobile")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.mobile")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.email")}</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder={t("members.personal_info.email_placeholder")} {...field} />
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
                                    <FormLabel>{t("members.personal_info.present_address")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("members.personal_info.present_address_placeholder")} {...field} />
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
                                    <FormLabel>{t("members.personal_info.permanent_address")}</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder={t("members.personal_info.permanent_address_placeholder")} {...field} />
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
        <SectionCard title={t("members.emergency_contact.section_title")} isOpen={openSections.section2} onToggle={() => toggleSection("section2")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.emergency_contact.name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.name")} {...field} />
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
                                <FormLabel>{t("members.emergency_contact.relation")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.relation")} {...field} />
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
                                <FormLabel>{t("members.emergency_contact.mobile")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.mobile")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
          </div>
        </SectionCard>

        {/* SECTION 3: রেফারেন্সদাতা */}
        <SectionCard title={t("members.reference.section_title")} isOpen={openSections.section3} onToggle={() => toggleSection("section3")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="referenceName"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.emergency_contact.name")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.name")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="referenceRelation"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.emergency_contact.relation")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.relation")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
            <FormField
              control={form.control}
              name="referenceMobile"
              render={({ field }) => {
                return ((
                              <FormItem>
                                <FormLabel>{t("members.personal_info.mobile")}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.mobile")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            ));
              }}
            />
          </div>
        </SectionCard>

        {/* SECTION 4: অঙ্গীকার */}
        <SectionCard title={t("members.commitment.section_title")} isOpen={openSections.section4} onToggle={() => toggleSection("section4")}>
          <div className="p-6 bg-muted/20 rounded-md border text-base text-foreground leading-relaxed">
            {t("members.commitment.description")}</div>
        </SectionCard>

        {/* SECTION 5: ডকুমেন্টস */}
        <SectionCard title={t("members.documents.section_title")} isOpen={openSections.section5} onToggle={() => toggleSection("section5")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UploadBox 
              title={t("members.documents.member_photo")} 
              subtext={t("members.documents.format_helper")} 
              inputRef={photoInputRef} 
              field="photoBase64" 
              dbTitle="Member Photo"
              existingUrl={existingPhoto} 
            />
            
            <UploadBox 
              title={t("members.documents.signature")} 
              subtext={t("members.documents.format_helper")} 
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
                                    <FormLabel className="text-base font-semibold">{t("members.documents.document_type")}</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={(val) => field.onChange(val)}
                                        value={field.value}
                                        className="flex space-x-6 mt-2"
                                      >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="NID" />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                            {t("members.documents.nid")}</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="BIRTH_CERTIFICATE" />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                            {t("members.documents.birth_certificate")}</FormLabel>
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
                  title={t("members.documents.nid_front")} 
                  subtext={t("members.documents.format_helper")} 
                  inputRef={nidFrontInputRef} 
                  field="nidFrontBase64" 
                  dbTitle="NID Front"
                  existingUrl={existingNidFront} 
                />
                <UploadBox 
                  title={t("members.documents.nid_back")} 
                  subtext={t("members.documents.format_helper")} 
                  inputRef={nidBackInputRef} 
                  field="nidBackBase64" 
                  dbTitle="NID Back"
                  existingUrl={existingNidBack} 
                />
              </>
            ) : (
              <UploadBox 
                title={t("members.documents.birth_certificate")} 
                subtext={t("members.documents.format_helper")} 
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
          <Button variant="outline" type="button" onClick={() => router.push("/members/manage")}>
            {t("members.actions.cancel")}</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("members.actions.saving") : t("members.actions.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
