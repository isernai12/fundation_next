import { NextResponse } from "next/server";
import { enDictionaries } from "@/i18n/dictionaries";
import legacyEn from "@/i18n/locales/en.json";

export async function GET() {
  return NextResponse.json({
    enDictionariesKeys: Object.keys(enDictionaries),
    beneficiariesKeys: enDictionaries.beneficiaries ? Object.keys(enDictionaries.beneficiaries) : null,
    legacyBeneficiariesKeys: legacyEn.beneficiaries ? Object.keys(legacyEn.beneficiaries) : null,
  });
}
