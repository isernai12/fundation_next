"use client"

import { useState } from "react"
import { saveSystemSettings } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FinancialRulesForm({ initialData }: { initialData: Record<string, string> }) {
  const [data, setData] = useState({
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
    setIsSaving(true)
    try {
      await saveSystemSettings(data, "Financial")
      toast.success("Financial rules saved successfully")
    } catch (err) {
      toast.error("Failed to save financial rules")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Rules</CardTitle>
        <CardDescription>Configure currency, number formats, and fiscal year settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input value={data.FIN_CURRENCY} onChange={e => setData({...data, FIN_CURRENCY: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input value={data.FIN_CURRENCY_SYMBOL} onChange={e => setData({...data, FIN_CURRENCY_SYMBOL: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Decimal Places</Label>
              <Select value={data.FIN_DECIMAL_PLACES} onValueChange={(val) => setData({...data, FIN_DECIMAL_PLACES: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select decimal places" />
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
              <Label>Number Format</Label>
              <Select value={data.FIN_NUMBER_FORMAT} onValueChange={(val) => setData({...data, FIN_NUMBER_FORMAT: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1,00,000.00">1,00,000.00 (Indian/South Asian)</SelectItem>
                  <SelectItem value="100,000.00">100,000.00 (Western)</SelectItem>
                  <SelectItem value="100.000,00">100.000,00 (European)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Financial Year Start</Label>
              <Select value={data.FIN_YEAR_START} onValueChange={(val) => setData({...data, FIN_YEAR_START: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Financial Year End</Label>
              <Select value={data.FIN_YEAR_END} onValueChange={(val) => setData({...data, FIN_YEAR_END: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Negative Number Style</Label>
              <Select value={data.FIN_NEGATIVE_STYLE} onValueChange={(val) => setData({...data, FIN_NEGATIVE_STYLE: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-100">-100 (Minus Sign)</SelectItem>
                  <SelectItem value="(100)">(100) (Parentheses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rounding Method</Label>
              <Select value={data.FIN_ROUNDING_METHOD} onValueChange={(val) => setData({...data, FIN_ROUNDING_METHOD: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rounding method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Math.round">Round to Nearest</SelectItem>
                  <SelectItem value="Math.ceil">Round Up</SelectItem>
                  <SelectItem value="Math.floor">Round Down</SelectItem>
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
