"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Building, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  username: z.string().min(1, "ব্যবহারকারীর নাম বা ইমেইল আবশ্যক।"),
  password: z.string().min(1, "পাসওয়ার্ড আবশ্যক।"),
  rememberMe: z.boolean(),
})

import { useBranding } from "@/components/providers/branding-provider"
import { useLanguage } from "@/i18n/LanguageProvider";

export function LoginForm() {
    const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const branding = useBranding()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      const res = await signIn("credentials", {
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe.toString(),
        redirect: false,
      })

      if (res?.error) {
        toast.error(res.error)
      } else if (res?.ok) {
        toast.success(t("app.k_09292c"))
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      toast.error(t("app.k_b4d33b"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 sm:p-6">
      <Card className="w-[400px]">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            {branding.loginLogo || branding.logo ? (
              <img src={branding.loginLogo || branding.logo!} alt={t("app.logo_8c2857")} className="h-16 w-auto object-contain" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{branding.foundationName || "Foundation ERP"}</CardTitle>
          <CardDescription>{t("app.k_641311")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("app.k_830f32")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("app.k_a5731a")} disabled={isLoading} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                  return ((
                                  <FormItem>
                                    <FormLabel>{t("app.k_3eb963")}</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder={t("app.k_c86221")} disabled={isLoading} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                ));
                }}
              />
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => {
                  return ((
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isLoading}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>{t("app.remember_me_b881a3")}</FormLabel>
                                    </div>
                                  </FormItem>
                                ));
                }}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
