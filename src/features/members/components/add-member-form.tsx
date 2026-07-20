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
import { createMember } from "../actions";

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

export function AddMemberForm({ groups }: { groups: any[] }) {
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

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      groupId: "",
      fullName: "",
      fatherName: "",
      motherName: "",
      dob: "",
      nationalId: "",
      occupation: "",
      education: "",
      presentAddress: "",
      permanentAddress: "",
      mobile: "",
      email: "",
      bloodGroup: "",

      emergencyContactName: "",
      emergencyContactRelation: "",
      emergencyContactMobile: "",

      referenceName: "",
      referenceRelation: "",
      referenceMobile: "",

      photoBase64: "",
      idDocumentType: "NID",
      idDocumentBase64: "",
    },
  });

  async function onSubmit(data: MemberFormValues) {
    setIsSubmitting(true);
    try {
      const res = await createMember(data);
      if (res.success) {
        toast.success("সদস্য সফলভাবে যুক্ত করা হয়েছে");
        router.push("/members/manage");
      } else {
        toast.error(res.error || "সদস্য যুক্ত করতে ব্যর্থ হয়েছে");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-24 max-w-5xl mx-auto">
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
              
              {!form.watch("photoBase64") ? (
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">ছবি আপলোড করুন</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG বা JPG</p>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden h-48 w-full md:w-48 mx-auto">
                  <Image 
                    src={form.watch("photoBase64") as string} 
                    alt="Preview" 
                    fill 
                    className="object-cover" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => form.setValue("photoBase64", "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
              
              {!form.watch("idDocumentBase64") ? (
                <div 
                  onClick={() => docInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">ডকুমেন্ট আপলোড করুন</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG বা JPG</p>
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden h-48 w-full">
                  <Image 
                    src={form.watch("idDocumentBase64") as string} 
                    alt="Preview" 
                    fill 
                    className="object-contain" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => form.setValue("idDocumentBase64", "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
