"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Camera, Shield, Smartphone, Mail } from "lucide-react"
import { updateUserProfile, uploadProfilePhoto, changeUserPassword } from "../actions"
import { useLanguage } from "@/i18n/LanguageProvider";

interface ProfileData {
  name: string
  username: string
  role: string
  mobile: string | null
  email: string | null
  photo: string | null
}

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
    const { t } = useLanguage();
  const router = useRouter()
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState({
    name: initialData.name || "",
    username: initialData.username || "",
    mobile: initialData.mobile || "",
  })
  const [photo, setPhoto] = useState(initialData.photo)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const res = await updateUserProfile(profile)
      if (res.success) {
        toast.success(t("profile.k_6dbaf2"))
        if (res.requireReauth) {
          toast.info(t("profile.k_43447a"))
          setTimeout(() => {
            return (signOut({ callbackUrl: window.location.origin + '/login' }));
          }, 2000)
        } else {
          router.refresh()
        }
      } else {
        toast.error(res.error)
      }
    } catch (err: any) {
      toast.error(t("profile.k_f4b1e8"))
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    
    setIsUploading(true)
    try {
      const res = await uploadProfilePhoto(formData)
      if (res.success) {
        toast.success(t("profile.k_d463f2"))
        setPhoto(res.url as string)
        await update({ image: res.url as string })
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error(t("profile.k_90591f"))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      return toast.error(t("profile.passwords_do_not_mat_0aa0fb"))
    }
    if (passwords.new.length < 6) {
      return toast.error(t("profile.k_66bd53"))
    }

    setIsChangingPassword(true)
    try {
      const res = await changeUserPassword({ current: passwords.current, new: passwords.new })
      if (res.success) {
        toast.success(t("profile.k_6e19f6"))
        setTimeout(() => {
          return (signOut({ callbackUrl: window.location.origin + '/login' }));
        }, 2000)
      } else {
        toast.error(res.error)
      }
    } catch (err: any) {
      toast.error(t("profile.k_881c57"))
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Avatar & Summary */}
      <div className="space-y-6 md:col-span-1">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted bg-muted flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt={t("profile.profile_cce99c")} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <label 
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                title={t("profile.k_3694c7")}
              >
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handlePhotoUpload} 
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold">{initialData.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">@{initialData.username}</p>
            <Badge variant="outline" className="mb-4">{initialData.role}</Badge>

            <div className="w-full space-y-3 text-sm text-left pt-4 border-t">
              <div className="flex items-center text-muted-foreground">
                <Smartphone className="w-4 h-4 mr-2" />
                <span>{initialData.mobile || "মোবাইল নম্বর নেই"}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                <span>{initialData.email || "ইমেইল নেই"}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Shield className="w-4 h-4 mr-2" />
                <span>{t("profile.k_cdb9a7")}{initialData.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Update Forms */}
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.profile_details_922a7c")}</CardTitle>
            <CardDescription>{t("profile.k_2711a1")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.full_name_d166ce")}</Label>
                  <Input 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.username_fe9a9c")}</Label>
                  <Input 
                    value={profile.username} 
                    onChange={e => setProfile({...profile, username: e.target.value})} 
                    required 
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("profile.k_1e38f0")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.mobile_d660e7")}</Label>
                  <Input 
                    value={profile.mobile} 
                    onChange={e => setProfile({...profile, mobile: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন (Save Changes)"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.change_password_2fcbe4")}</CardTitle>
            <CardDescription>{t("profile.k_c79597")}</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-sm">
                <Label>{t("profile.current_password_7f6933")}</Label>
                <Input 
                  type="password" 
                  value={passwords.current} 
                  onChange={e => setPasswords({...passwords, current: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("profile.new_password_b27237")}</Label>
                  <Input 
                    type="password" 
                    value={passwords.new} 
                    onChange={e => setPasswords({...passwords, new: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("profile.confirm_password_d60c9f")}</Label>
                  <Input 
                    type="password" 
                    value={passwords.confirm} 
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                    required 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" variant="destructive" disabled={isChangingPassword}>
                {isChangingPassword ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
