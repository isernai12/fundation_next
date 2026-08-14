import { authorizePage } from "@/lib/rbac"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await authorizePage("Beneficiaries", "View")
  
  return <>{children}</>
}
