import { LoginForm } from "./login-form"
import { getAuthSession } from "@/lib/auth"

import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getAuthSession()
  const user = session?.user as any

  if (user?.id) {
    redirect("/")
  }

  return <LoginForm />
}
