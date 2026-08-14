"use client"

import { useState } from "react"
import { saveFoundationProfile } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/i18n/LanguageProvider";

export function ProfileForm({ initialData }: { initialData: any }) {
    const { t } = useLanguage();
  const [data, setData] = useState(initialData)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // Remove id before saving if it exists and we're not using it directly in update
      const { id, updatedAt, updatedBy, ...saveData } = data
      await saveFoundationProfile(saveData)
      toast.success(t("settings.profile_saved_succes_be40cc"))
    } catch (err) {
      toast.error(t("settings.failed_to_save_profi_4d502a"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.foundation_profile_c44f0c")}</CardTitle>
        <CardDescription>{t("settings.update_your_organiza_6ffc1c")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("settings.organization_name_c1ca92")}</Label>
              <Input value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.registration_number_e4a660")}</Label>
              <Input value={data.registrationNumber || ""} onChange={e => setData({...data, registrationNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.email_ce8ae9")}</Label>
              <Input type="email" value={data.email || ""} onChange={e => setData({...data, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.phone_bcc254")}</Label>
              <Input value={data.phone || ""} onChange={e => setData({...data, phone: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{t("settings.address_dd7bf2")}</Label>
              <Textarea value={data.address || ""} onChange={e => setData({...data, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.website_15bbb9")}</Label>
              <Input value={data.website || ""} onChange={e => setData({...data, website: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.currency_386c33")}</Label>
              <Input value={data.currency || "BDT"} onChange={e => setData({...data, currency: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
