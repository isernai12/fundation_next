"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitMemberRequest } from "../actions";
import { memberRequestSchema, type MemberRequestInput } from "../schema";
import Link from "next/link";
import Image from "next/image";

interface MemberRequestFormProps {
  groups: Array<{ id: string; name: string; code: string }>;
}

export function MemberRequestForm({ groups }: MemberRequestFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; applicationNumber: string } | null>(null);

  const form = useForm<MemberRequestInput>({
    resolver: zodResolver(memberRequestSchema),
    defaultValues: {
      fullName: "",
      fatherName: "",
      motherName: "",
      gender: "",
      dob: "",
      nationalId: "",
      idDocumentType: "",
      occupation: "",
      bloodGroup: "",
      education: "",
      maritalStatus: "",
      mobile: "",
      altMobile: "",
      email: "",
      phone: "",
      presentAddress: "",
      permanentAddress: "",
      emergencyContactName: "",
      emergencyContactMobile: "",
      emergencyContactRelation: "",
      referenceName: "",
      referenceMobile: "",
      referenceRelation: "",
      groupId: "",
      reasonForJoining: "",
      photoBase64: "",
      nidFrontBase64: "",
      nidBackBase64: "",
      birthCertificateBase64: "",
      signatureBase64: "",
    },
  });

  const idDocumentType = form.watch("idDocumentType");

  const onSubmit = async (values: MemberRequestInput) => {
    setIsSubmitting(true);
    try {
      const result = await submitMemberRequest(values);
      if (result.success && result.applicationNumber) {
        toast.success(t("member-requests.public.form.successMessage"));
        localStorage.setItem("member_request_id", result.id!);
        localStorage.setItem("member_request_number", result.applicationNumber);
        setSuccessData({
          id: result.id!,
          applicationNumber: result.applicationNumber,
        });
      } else {
        toast.error((result as any).error || t("member-requests.public.form.errorMessage"));
      }
    } catch (error) {
      toast.error(t("member-requests.public.form.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImageUpload = (name: keyof MemberRequestInput, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, field.onChange)}
              />
              {field.value && typeof field.value === "string" && (
                <div className="relative w-32 h-32 overflow-hidden rounded-md border">
                  <Image src={field.value} alt={label} fill className="object-cover" />
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  if (successData) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-600">
            {t("member-requests.public.form.applicationSubmitted")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">{t("member-requests.public.form.applicationNumberIs")}</p>
            <p className="text-4xl font-bold tracking-wider">{successData.applicationNumber}</p>
            <p className="text-sm text-muted-foreground mt-4">
              {t("member-requests.public.form.saveApplicationNumberInfo")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
            <Button asChild variant="default">
              <Link href="/member-request/status">
                {t("member-requests.public.form.checkStatus")}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => {
              form.reset();
              setSuccessData(null);
            }}>
              {t("member-requests.public.form.submitAnother")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto py-8 px-4">
        
        {/* Group Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.groupSelection")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("member-requests.public.form.group")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("member-requests.public.form.selectGroup")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.personalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.fullName")} *</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fatherName" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.fatherName")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="motherName" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.motherName")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.dob")}</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.gender")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t("member-requests.public.form.selectGender")} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Male">{t("member-requests.public.form.genderMale")}</SelectItem>
                    <SelectItem value="Female">{t("member-requests.public.form.genderFemale")}</SelectItem>
                    <SelectItem value="Other">{t("member-requests.public.form.genderOther")}</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="nationalId" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.nationalId")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="idDocumentType" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.idDocumentType")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t("member-requests.public.form.selectDocumentType")} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="NID">{t("member-requests.public.form.docTypeNID")}</SelectItem>
                    <SelectItem value="BIRTH_CERTIFICATE">{t("member-requests.public.form.docTypeBirthCert")}</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="occupation" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.occupation")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="education" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.education")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bloodGroup" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.bloodGroup")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t("member-requests.public.form.selectBloodGroup")} /></SelectTrigger></FormControl>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="maritalStatus" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.maritalStatus")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t("member-requests.public.form.selectMaritalStatus")} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Single">{t("member-requests.public.form.statusSingle")}</SelectItem>
                    <SelectItem value="Married">{t("member-requests.public.form.statusMarried")}</SelectItem>
                    <SelectItem value="Divorced">{t("member-requests.public.form.statusDivorced")}</SelectItem>
                    <SelectItem value="Widowed">{t("member-requests.public.form.statusWidowed")}</SelectItem>
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.contactInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="mobile" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.mobile")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="altMobile" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.altMobile")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.email")}</FormLabel><FormControl><Input type="email" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.phone")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="md:col-span-2">
              <FormField control={form.control} name="presentAddress" render={({ field }) => (
                <FormItem><FormLabel>{t("member-requests.public.form.presentAddress")}</FormLabel><FormControl><Textarea {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="md:col-span-2">
              <FormField control={form.control} name="permanentAddress" render={({ field }) => (
                <FormItem><FormLabel>{t("member-requests.public.form.permanentAddress")}</FormLabel><FormControl><Textarea {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.emergencyContact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.emergencyName")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="emergencyContactMobile" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.emergencyMobile")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="emergencyContactRelation" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.emergencyRelation")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Reference */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.reference")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="referenceName" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.referenceName")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="referenceMobile" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.referenceMobile")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="referenceRelation" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.referenceRelation")}</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.documents")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderImageUpload("photoBase64", t("member-requests.public.form.photo"))}
            
            {idDocumentType === "NID" && (
              <>
                {renderImageUpload("nidFrontBase64", t("member-requests.public.form.nidFront"))}
                {renderImageUpload("nidBackBase64", t("member-requests.public.form.nidBack"))}
              </>
            )}
            
            {idDocumentType === "BIRTH_CERTIFICATE" && (
              renderImageUpload("birthCertificateBase64", t("member-requests.public.form.birthCertificate"))
            )}

            {renderImageUpload("signatureBase64", t("member-requests.public.form.signature"))}
          </CardContent>
        </Card>

        {/* Additional */}
        <Card>
          <CardHeader>
            <CardTitle>{t("member-requests.public.form.additional")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField control={form.control} name="reasonForJoining" render={({ field }) => (
              <FormItem><FormLabel>{t("member-requests.public.form.reasonForJoining")}</FormLabel><FormControl><Textarea {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? t("member-requests.public.form.submitting") : t("member-requests.public.form.submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
