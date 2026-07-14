"use client"

import { useState } from "react"
import { saveSystemSettings } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function GeneralSettingsForm({ initialData }: { initialData: Record<string, string> }) {
  const [data, setData] = useState({
    appName: initialData.appName || "Foundation ERP",
    dateFormat: initialData.dateFormat || "MM/DD/YYYY",
    paginationSize: initialData.paginationSize || "10",
    theme: initialData.theme || "system",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await saveSystemSettings(data)
      toast.success("Settings saved successfully")
    } catch (err) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure global application preferences and defaults.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Application Name</Label>
              <Input value={data.appName} onChange={e => setData({...data, appName: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={data.dateFormat} onValueChange={(val) => setData({...data, dateFormat: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Pagination Size</Label>
              <Select value={data.paginationSize} onValueChange={(val) => setData({...data, paginationSize: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Rows</SelectItem>
                  <SelectItem value="25">25 Rows</SelectItem>
                  <SelectItem value="50">50 Rows</SelectItem>
                  <SelectItem value="100">100 Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Theme</Label>
              <Select value={data.theme} onValueChange={(val) => setData({...data, theme: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
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
