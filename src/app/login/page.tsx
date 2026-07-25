import { LoginForm } from "./login-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (user?.id) {
    redirect("/")
  }

  return <LoginForm />
}
