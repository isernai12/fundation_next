"use client"

import { useState } from "react"
import { saveSystemSettings } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/i18n/LanguageProvider";

export function GeneralSettingsForm({ initialData }: { initialData: Record<string, string> }) {
    const { t } = useLanguage();
  const [data, setData] = useState({
    APP_TIMEZONE: initialData.APP_TIMEZONE || "UTC",
    APP_DATE_FORMAT: initialData.APP_DATE_FORMAT || "DD/MM/YYYY",
    APP_THEME: initialData.APP_THEME || "system",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await saveSystemSettings(data)
      toast.success(t("settings.settings_saved_succe_fe016d"))
    } catch (err) {
      toast.error(t("settings.failed_to_save_setti_825f44"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.system_settings_e4709a")}</CardTitle>
        <CardDescription>{t("settings.configure_global_app_2ece82")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("settings.time_zone_45c106")}</Label>
              <Select value={data.APP_TIMEZONE} onValueChange={(val) => setData({...data, APP_TIMEZONE: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_time_zone_13c570")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Dhaka">{t("settings.asia_dhaka_1544c9")}</SelectItem>
                  <SelectItem value="Asia/Kolkata">{t("settings.asia_kolkata_b6672f")}</SelectItem>
                  <SelectItem value="Asia/Dubai">{t("settings.asia_dubai_d441b2")}</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">{t("settings.europe_london_5e9c86")}</SelectItem>
                  <SelectItem value="America/New_York">{t("settings.america_new_york_786bd9")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.date_format_8b6f6d")}</Label>
              <Select value={data.APP_DATE_FORMAT} onValueChange={(val) => setData({...data, APP_DATE_FORMAT: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_date_format_20f3a8")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">{t("settings.dd_mm_yyyy_e3903c")}</SelectItem>
                  <SelectItem value="MM/DD/YYYY">{t("settings.mm_dd_yyyy_addc6b")}</SelectItem>
                  <SelectItem value="YYYY-MM-DD">{t("settings.yyyy_mm_dd_70e7a6")}</SelectItem>
                  <SelectItem value="DD MMM YYYY">{t("settings.dd_mmm_yyyy_b80ad7")}</SelectItem>
                  <SelectItem value="DD MMMM YYYY">{t("settings.dd_mmmm_yyyy_bc0bf0")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.default_theme_553b7d")}</Label>
              <Select value={data.APP_THEME} onValueChange={(val) => setData({...data, APP_THEME: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_theme_d19d56")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("settings.light_9914a0")}</SelectItem>
                  <SelectItem value="dark">{t("settings.dark_a18366")}</SelectItem>
                  <SelectItem value="system">{t("settings.system_default_750ad9")}</SelectItem>
                </SelectContent>
              </Select>
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
