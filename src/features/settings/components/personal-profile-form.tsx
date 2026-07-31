"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { saveUserProfile } from "@/features/settings/actions";
import { useSession } from "next-auth/react";
import { Camera, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface PersonalProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    photo: string;
  };
}

export function PersonalProfileForm({ user }: PersonalProfileFormProps) {
    const { t } = useLanguage();
  const { update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    photo: user.photo || "",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "profiles");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (result.secure_url) {
        setFormData((prev) => ({ ...prev, photo: result.secure_url }));
        toast.success(t("settings.profile_picture_uplo_b383f8"));
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error(t("settings.failed_to_upload_pro_70e7ec"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveUserProfile(user.id, formData);
      await update({ name: formData.name, image: formData.photo });
      toast.success(t("settings.personal_profile_upd_90e66a"));
    } catch (error) {
      toast.error(t("settings.failed_to_update_pro_9470d6"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.personal_profile_f876d5")}</CardTitle>
        <CardDescription>
          {t("settings.update_your_personal_34a0c9")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-sm flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt={t("settings.profile_cce99c")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <Label
                  htmlFor="photo-upload"
                  className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t("settings.change_picture_72c69e")}</Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.full_name_630058")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">{t("settings.mobile_number_a4c72a")}</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">{t("settings.email_address_643a86")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("settings.save_changes_f5d604")}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
