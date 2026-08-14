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

export function FinancialRulesForm({ initialData }: { initialData: Record<string, string> }) {
    const { t } = useLanguage();
  const [data, setData] = useState({
    DEFAULT_MONTHLY_CONTRIBUTION: initialData.DEFAULT_MONTHLY_CONTRIBUTION || initialData["membership.monthlyFee"] || "100",
    FIN_CURRENCY: initialData.FIN_CURRENCY || "BDT",
    FIN_CURRENCY_SYMBOL: initialData.FIN_CURRENCY_SYMBOL || "৳",
    FIN_DECIMAL_PLACES: initialData.FIN_DECIMAL_PLACES || "2",
    FIN_NUMBER_FORMAT: initialData.FIN_NUMBER_FORMAT || "1,00,000.00",
    FIN_YEAR_START: initialData.FIN_YEAR_START || "July",
    FIN_YEAR_END: initialData.FIN_YEAR_END || "June",
    FIN_NEGATIVE_STYLE: initialData.FIN_NEGATIVE_STYLE || "-100",
    FIN_ROUNDING_METHOD: initialData.FIN_ROUNDING_METHOD || "Math.round",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const feeNum = parseInt(data.DEFAULT_MONTHLY_CONTRIBUTION, 10)
    if (isNaN(feeNum) || feeNum <= 0) {
      toast.error("Monthly fee must be a positive number greater than 0")
      return
    }

    setIsSaving(true)
    try {
      const res = await saveSystemSettings(data, "Financial")
      if (res.success) {
        toast.success(t("settings.financial_rules_save_e666eb"))
      } else {
        toast.error(res.error || t("settings.failed_to_save_finan_75c2f8"))
      }
    } catch (err) {
      toast.error(t("settings.failed_to_save_finan_75c2f8"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.financial_rules_093399")}</CardTitle>
        <CardDescription>{t("settings.configure_currency_n_85f01f")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label className="text-sm font-semibold">Monthly Membership Fee (মাসিক সদস্য চাঁদা)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-muted-foreground">৳</span>
                <Input
                  type="number"
                  min="1"
                  value={data.DEFAULT_MONTHLY_CONTRIBUTION}
                  onChange={e => setData({...data, DEFAULT_MONTHLY_CONTRIBUTION: e.target.value})}
                  className="pl-8 font-mono font-bold"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Monthly fee amount used for generating new dues.</p>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.default_currency_9992b8")}</Label>
              <Input value={data.FIN_CURRENCY} onChange={e => setData({...data, FIN_CURRENCY: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.currency_symbol_94cebe")}</Label>
              <Input value={data.FIN_CURRENCY_SYMBOL} onChange={e => setData({...data, FIN_CURRENCY_SYMBOL: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.decimal_places_879fee")}</Label>
              <Select value={data.FIN_DECIMAL_PLACES} onValueChange={(val) => setData({...data, FIN_DECIMAL_PLACES: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_decimal_place_210138")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.number_format_fb660c")}</Label>
              <Select value={data.FIN_NUMBER_FORMAT} onValueChange={(val) => setData({...data, FIN_NUMBER_FORMAT: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_number_format_c5d426")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1,00,000.00">{t("settings.1_00_000_00_indian_s_ec5681")}</SelectItem>
                  <SelectItem value="100,000.00">{t("settings.100_000_00_western_158e7e")}</SelectItem>
                  <SelectItem value="100.000,00">{t("settings.100_000_00_european_a787f3")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.financial_year_start_905837")}</Label>
              <Select value={data.FIN_YEAR_START} onValueChange={(val) => setData({...data, FIN_YEAR_START: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_month_178fc2")} />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.financial_year_end_5b49a3")}</Label>
              <Select value={data.FIN_YEAR_END} onValueChange={(val) => setData({...data, FIN_YEAR_END: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_month_178fc2")} />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.negative_number_styl_d0c78d")}</Label>
              <Select value={data.FIN_NEGATIVE_STYLE} onValueChange={(val) => setData({...data, FIN_NEGATIVE_STYLE: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_style_ad79d8")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-100">{t("settings.100_minus_sign_2de686")}</SelectItem>
                  <SelectItem value="(100)">{t("settings.100_parentheses_b46423")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.rounding_method_3637b0")}</Label>
              <Select value={data.FIN_ROUNDING_METHOD} onValueChange={(val) => setData({...data, FIN_ROUNDING_METHOD: val})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.select_rounding_meth_40ef4f")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Math.round">{t("settings.round_to_nearest_ddd887")}</SelectItem>
                  <SelectItem value="Math.ceil">{t("settings.round_up_1f0e81")}</SelectItem>
                  <SelectItem value="Math.floor">{t("settings.round_down_6c4a2b")}</SelectItem>
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
