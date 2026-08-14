"use client"

import { useState } from "react"
import { saveUserPreferences } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/i18n/LanguageProvider";

export function PreferencesForm({ initialData, userId }: { initialData: any, userId: string }) {
    const { t } = useLanguage();
  const [data, setData] = useState({
    language: initialData?.language || "en",
    theme: initialData?.theme || "system",
    dateFormatOverride: initialData?.dateFormatOverride || "",
    timeFormat: initialData?.timeFormat || "12h",
    tableDensity: initialData?.tableDensity || "comfortable",
    defaultDashboard: initialData?.defaultDashboard || "overview",
    itemsPerPage: initialData?.itemsPerPage || "10",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await saveUserPreferences(userId, data)
      toast.success(t("settings.preferences_saved_su_5aeb6d"))
    } catch (err) {
      toast.error(t("settings.failed_to_save_prefe_7c7ee9"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.user_preferences_560323")}</CardTitle>
        <CardDescription>{t("settings.personalize_your_exp_7c3e54")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("settings.language_4994a8")}</Label>
              <Select value={data.language} onValueChange={(val) => setData({...data, language: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_language_653777")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("settings.english_78463a")}</SelectItem>
                  <SelectItem value="es">{t("settings.spanish_cb5480")}</SelectItem>
                  <SelectItem value="bn">{t("settings.bengali_a56dcb")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.theme_d72175")}</Label>
              <Select value={data.theme} onValueChange={(val) => setData({...data, theme: val})}>
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
            <div className="space-y-2">
              <Label>{t("settings.date_format_override_9cb399")}</Label>
              <Select value={data.dateFormatOverride} onValueChange={(val) => setData({...data, dateFormatOverride: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_date_format_o_6f1467")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("settings.none_use_system_defa_0eb6da")}</SelectItem>
                  <SelectItem value="DD/MM/YYYY">{t("settings.dd_mm_yyyy_e3903c")}</SelectItem>
                  <SelectItem value="MM/DD/YYYY">{t("settings.mm_dd_yyyy_addc6b")}</SelectItem>
                  <SelectItem value="YYYY-MM-DD">{t("settings.yyyy_mm_dd_70e7a6")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.time_format_6b366d")}</Label>
              <Select value={data.timeFormat} onValueChange={(val) => setData({...data, timeFormat: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_time_format_39b4d8")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">{t("settings.12_hour_a0f7ac")}</SelectItem>
                  <SelectItem value="24h">{t("settings.24_hour_33ddea")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.table_density_41ee8b")}</Label>
              <Select value={data.tableDensity} onValueChange={(val) => setData({...data, tableDensity: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_table_density_853307")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">{t("settings.compact_b1fe2c")}</SelectItem>
                  <SelectItem value="comfortable">{t("settings.comfortable_241647")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.default_dashboard_3e0ab6")}</Label>
              <Select value={data.defaultDashboard} onValueChange={(val) => setData({...data, defaultDashboard: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_default_dashb_ca5de8")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">{t("settings.overview_3b8782")}</SelectItem>
                  <SelectItem value="financials">{t("settings.financials_5974cb")}</SelectItem>
                  <SelectItem value="operations">{t("settings.operations_456d0d")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.items_per_page_d2d407")}</Label>
              <Select value={data.itemsPerPage} onValueChange={(val) => setData({...data, itemsPerPage: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_items_per_pag_5e9872")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
