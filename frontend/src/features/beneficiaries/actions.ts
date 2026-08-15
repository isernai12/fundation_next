"use server";

import { beneficiarySchema, type BeneficiaryFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { beneficiariesApi, uploadApi } from "@/lib/api";

export async function getBeneficiaries() {
  if (!(await checkPermission("Beneficiaries", "View"))) return [];
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const res = await beneficiariesApi.list({ page_size: 1000 }, token);
    return res.items.map((item) => {
      const b = item as any;
      return {
        id: b.id,
        beneficiaryId: b.beneficiary_id || b.id,
        name: b.name,
        fullName: b.name,
        mobile: b.mobile,
        nationalId: b.national_id,
        fatherOrHusbandName: b.father_or_husband_name || null,
        motherName: b.mother_name || null,
        address: b.address || null,
        occupation: b.occupation || null,
        monthlyIncome: b.monthly_income || null,
        category: b.category || null,
        status: b.status,
        memberId: b.member_id || null,
        createdAt: new Date(b.created_at),
        updatedAt: new Date(b.updated_at),
        member: b.member_id ? { fullName: b.name, memberId: b.member_id } : null,
      };
    });
  } catch (error) {
    return [];
  }
}

export async function getBeneficiary(id: string) {
  if (!(await checkPermission("Beneficiaries", "View"))) return null;
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const item = await beneficiariesApi.get(id, token);
    const b = item as any;
    return {
      id: b.id,
      beneficiaryId: b.beneficiary_id || b.id,
      name: b.name,
      fullName: b.name,
      mobile: b.mobile,
      nationalId: b.national_id,
      fatherOrHusbandName: b.father_or_husband_name || null,
      motherName: b.mother_name || null,
      address: b.address || null,
      presentAddress: b.address || null,
      permanentAddress: b.address || null,
      emergencyContactName: null as string | null,
      emergencyContactRelation: null as string | null,
      emergencyContactMobile: null as string | null,
      beneficiaryPhoto: null as string | null,
      nidOrBirthCertificate: null as string | null,
      occupation: b.occupation || null,
      monthlyIncome: b.monthly_income || null,
      category: b.category || null,
      status: b.status,
      memberId: b.member_id || null,
      createdAt: new Date(b.created_at),
      updatedAt: new Date(b.updated_at),
      member: b.member_id ? { fullName: b.name, memberId: b.member_id } : null,
      loans: [],
      grants: [],
      documents: (b.documents || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        secureUrl: d.file_url,
        fileUrl: d.file_url,
        cloudinaryPublicId: d.cloudinary_public_id,
      })),
      beneficiaryPayments: [],
    };
  } catch (error) {
    return null;
  }
}

export async function createBeneficiary(data: BeneficiaryFormValues) {
  await requirePermission("Beneficiaries", "Add");
  const parsed = beneficiarySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid data", details: parsed.error.format() };
  }

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const uploadedDocs = [];
    if (pd.photoBase64) {
      const up = await uploadApi.uploadBase64(pd.photoBase64, "foundation/beneficiaries/photos", "photo.jpg", token);
      uploadedDocs.push({ title: "Beneficiary Photo", file_url: up.secure_url, cloudinary_public_id: up.public_id });
    }
    if (pd.signatureBase64) {
      const up = await uploadApi.uploadBase64(pd.signatureBase64, "foundation/beneficiaries/signatures", "signature.png", token);
      uploadedDocs.push({ title: "Signature", file_url: up.secure_url, cloudinary_public_id: up.public_id });
    }
    if (pd.idDocumentType === "NID") {
      if (pd.nidFrontBase64) {
        const up = await uploadApi.uploadBase64(pd.nidFrontBase64, "foundation/beneficiaries/ids", "nid_front.jpg", token);
        uploadedDocs.push({ title: "NID Front", file_url: up.secure_url, cloudinary_public_id: up.public_id });
      }
      if (pd.nidBackBase64) {
        const up = await uploadApi.uploadBase64(pd.nidBackBase64, "foundation/beneficiaries/ids", "nid_back.jpg", token);
        uploadedDocs.push({ title: "NID Back", file_url: up.secure_url, cloudinary_public_id: up.public_id });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE" && pd.birthCertificateBase64) {
      const up = await uploadApi.uploadBase64(pd.birthCertificateBase64, "foundation/beneficiaries/ids", "birth_certificate.jpg", token);
      uploadedDocs.push({ title: "Birth Certificate", file_url: up.secure_url, cloudinary_public_id: up.public_id });
    }

    const beneficiary = await beneficiariesApi.create(
      {
        name: pd.fullName.trim(),
        mobile: pd.mobile?.trim() || "",
        national_id: pd.nationalId?.trim() || null,
        address: pd.address?.trim() || pd.presentAddress?.trim() || null,
        category: pd.category || null,
        monthly_income: pd.monthlyIncome || null,
        occupation: pd.occupation?.trim() || null,
        member_id: pd.memberId || null,
        documents: uploadedDocs,
      },
      token
    );

    revalidatePath("/beneficiaries");
    return { success: true, data: beneficiary };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create beneficiary" };
  }
}

export async function updateBeneficiary(id: string, data: BeneficiaryFormValues) {
  await requirePermission("Beneficiaries", "Edit");
  const parsed = beneficiarySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const beneficiary = await beneficiariesApi.update(
      id,
      {
        name: pd.fullName.trim(),
        mobile: pd.mobile?.trim() || "",
        national_id: pd.nationalId?.trim() || null,
        address: pd.address?.trim() || pd.presentAddress?.trim() || null,
        category: pd.category || null,
        monthly_income: pd.monthlyIncome || null,
        occupation: pd.occupation?.trim() || null,
        member_id: pd.memberId || null,
      },
      token
    );

    revalidatePath("/beneficiaries");
    revalidatePath(`/beneficiaries/${id}`);
    return { success: true, data: beneficiary };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update beneficiary" };
  }
}

export async function deleteBeneficiary(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Beneficiaries", "Delete");
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await beneficiariesApi.delete(id, token);
    revalidatePath("/beneficiaries");
    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete beneficiary" };
  }
}

export async function deleteBeneficiaryDocument(beneficiaryId: string, title: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Beneficiaries", "Delete");
  revalidatePath(`/beneficiaries/${beneficiaryId}`);
  revalidatePath(`/beneficiaries/${beneficiaryId}/edit`);
  return { success: true, error: undefined };
}
