"use client";

import { useState, useRef, useEffect } from "react";
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
import { Member } from "@prisma/client";
import { formatDate } from "@/lib/format";

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
}) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <Card className="mb-6 shadow-sm border-muted">
      <CardHeader className="py-4 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-transparent">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardHeader>
      <CollapsibleContent>
        <CardContent className="pt-6">{children}</CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

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
  const docInputRef = useRef<HTMLInputElement>(null);

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
      
      photoBase64: "",
      idDocumentType: "NID",
      idDocumentBase64: "",
    },
  });

  const existingPhoto = member?.documents?.find((d: any) => d.title === "Member Photo")?.secureUrl;
  const existingIdDoc = member?.documents?.find((d: any) => d.title === "National ID" || d.title === "Birth Certificate")?.secureUrl;

  async function onSubmit(data: MemberFormValues) {
    setIsSubmitting(true);
    try {
      const res = mode === "edit" ? await updateMember(memberId!, data) : await createMember(data);
      if (res.success) {
        toast.success(mode === "edit" ? "সদস্য আপডেট করা হয়েছে" : "সদস্য যুক্ত করা হয়েছে");
        router.push("/members/manage");
      } else {
        toast.error(res.error || "সদস্য সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }
    } catch (error) {
      toast.error("অপ্রত্যাশিত ত্রুটি ঘটেছে");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photoBase64" | "idDocumentBase64"
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-24 max-w-5xl mx-auto space-y-6">
        
        {mode === "edit" && member && (
          <Card className="bg-muted/30">
            <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">সদস্য আইডি</p>
                <p className="font-mono font-medium">{member.memberId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">যোগদানের তারিখ</p>
                <p className="font-medium">{formatDate(member.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">গ্রুপ নির্বাচন করুন *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full md:w-[400px]">
                      <SelectValue placeholder="একটি গ্রুপ নির্বাচন করুন" />
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
            )}
          />
        </div>

        {/* SECTION 1: ব্যক্তিগত তথ্য */}
        <SectionCard title="১. ব্যক্তিগত তথ্য" isOpen={openSections.section1} onToggle={() => toggleSection("section1")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পূর্ণ নাম *</FormLabel>
                  <FormControl>
                    <Input placeholder="সদস্যের পূর্ণ নাম" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fatherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পিতার নাম</FormLabel>
                  <FormControl>
                    <Input placeholder="পিতার নাম" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মাতার নাম</FormLabel>
                  <FormControl>
                    <Input placeholder="মাতার নাম" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>জন্ম তারিখ</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="এনআইডি বা জন্ম নিবন্ধন নম্বর" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>পেশা / কর্মক্ষেত্র</FormLabel>
                  <FormControl>
                    <Input placeholder="পেশা বা কর্মক্ষেত্র" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>শিক্ষাগত যোগ্যতা</FormLabel>
                  <FormControl>
                    <Input placeholder="শিক্ষাগত যোগ্যতা" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>রক্তের গ্রুপ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="রক্তের গ্রুপ নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মোবাইল নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="মোবাইল নম্বর" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ইমেইল (যদি থাকে)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="presentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>বর্তমান ঠিকানা</FormLabel>
                    <FormControl>
                      <Textarea placeholder="বর্তমান ঠিকানা লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>স্থায়ী ঠিকানা</FormLabel>
                    <FormControl>
                      <Textarea placeholder="স্থায়ী ঠিকানা লিখুন" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </SectionCard>

        {/* SECTION 2: জরুরি যোগাযোগ */}
        <SectionCard title="২. জরুরি যোগাযোগ" isOpen={openSections.section2} onToggle={() => toggleSection("section2")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>নাম</FormLabel>
                  <FormControl>
                    <Input placeholder="নাম" {...field} />
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
                  <FormLabel>সম্পর্ক</FormLabel>
                  <FormControl>
                    <Input placeholder="সম্পর্ক" {...field} />
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
                  <FormLabel>মোবাইল নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="মোবাইল নম্বর" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        {/* SECTION 3: রেফারেন্সদাতা */}
        <SectionCard title="৩. রেফারেন্সদাতা (যিনি সদস্যকে সুপারিশ করেছেন)" isOpen={openSections.section3} onToggle={() => toggleSection("section3")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="referenceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>নাম</FormLabel>
                  <FormControl>
                    <Input placeholder="নাম" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceRelation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>সম্পর্ক</FormLabel>
                  <FormControl>
                    <Input placeholder="সম্পর্ক" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>মোবাইল নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="মোবাইল নম্বর" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        {/* SECTION 4: অঙ্গীকার */}
        <SectionCard title="৪. অঙ্গীকার" isOpen={openSections.section4} onToggle={() => toggleSection("section4")}>
          <div className="p-6 bg-muted/20 rounded-md border text-base text-foreground leading-relaxed">
            আমি ঘোষণা করছি যে ফাউন্ডেশনের উদ্দেশ্য, আদর্শ ও নীতিমালার প্রতি সম্মান রেখে একজন দায়িত্বশীল সদস্য হিসেবে কাজ করার চেষ্টা করব। আমি আমার সামর্থ্য অনুযায়ী ফাউন্ডেশনের মানবিক কার্যক্রমে সহযোগিতা করব এবং সংগঠনের শৃঙ্খলা, পারস্পরিক সম্মান ও ভ্রাতৃত্বের মূল্যবোধ বজায় রাখব ইনশাআল্লাহ।
          </div>
        </SectionCard>

        {/* SECTION 5: ডকুমেন্টস */}
        <SectionCard title="৫. ডকুমেন্টস" isOpen={openSections.section5} onToggle={() => toggleSection("section5")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Photo Upload */}
            <div className="space-y-4">
              <h3 className="font-medium text-base mb-2">সদস্যের ছবি</h3>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={photoInputRef}
                onChange={(e) => handleFileChange(e, "photoBase64")}
              />
              
              {!form.watch("photoBase64") && !existingPhoto ? (
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">ছবি আপলোড করুন</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG বা JPG</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative border rounded-lg overflow-hidden h-48 w-full md:w-48 mx-auto group">
                    <Image 
                      src={(form.watch("photoBase64") as string) || existingPhoto} 
                      alt="Preview" 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                      {!form.watch("photoBase64") && existingPhoto && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this document?")) {
                              const doc = member.documents.find((d: any) => d.title === "Member Photo");
                              if (doc) {
                                const res = await deleteMemberDocument(doc.id);
                                if (res.success) {
                                  toast.success("Document deleted");
                                  router.refresh();
                                } else {
                                  toast.error(res.error);
                                }
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    {form.watch("photoBase64") && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => form.setValue("photoBase64", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!form.watch("photoBase64") && existingPhoto && (
                    <div className="text-center text-xs text-muted-foreground">
                      Uploaded on: {formatDate(member.documents.find((d: any) => d.title === "Member Photo")?.createdAt)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="font-medium text-base mb-2">জাতীয় পরিচয়পত্র অথবা জন্ম নিবন্ধন</h3>
              
              <FormField
                control={form.control}
                name="idDocumentType"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="NID" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            জাতীয় পরিচয়পত্র
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="BIRTH_CERTIFICATE" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            জন্ম নিবন্ধন
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={docInputRef}
                onChange={(e) => handleFileChange(e, "idDocumentBase64")}
              />
              
              {!form.watch("idDocumentBase64") && !existingIdDoc ? (
                <div 
                  onClick={() => docInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">ডকুমেন্ট আপলোড করুন</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG বা JPG</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative border rounded-lg overflow-hidden h-48 w-full group">
                    <Image 
                      src={(form.watch("idDocumentBase64") as string) || existingIdDoc} 
                      alt="Preview" 
                      fill 
                      className="object-contain" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => docInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                      {!form.watch("idDocumentBase64") && existingIdDoc && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this document?")) {
                              const doc = member.documents.find((d: any) => d.title === "National ID" || d.title === "Birth Certificate");
                              if (doc) {
                                const res = await deleteMemberDocument(doc.id);
                                if (res.success) {
                                  toast.success("Document deleted");
                                  router.refresh();
                                } else {
                                  toast.error(res.error);
                                }
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    {form.watch("idDocumentBase64") && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => form.setValue("idDocumentBase64", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {!form.watch("idDocumentBase64") && existingIdDoc && (
                    <div className="text-center text-xs text-muted-foreground">
                      Uploaded on: {formatDate(member.documents.find((d: any) => d.title === "National ID" || d.title === "Birth Certificate")?.createdAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ACTIONS */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" type="button" onClick={() => router.push("/members/manage")}>
            বাতিল
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
