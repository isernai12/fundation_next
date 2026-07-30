import { authorizePage } from "@/lib/rbac"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await authorizePage("Loans", "View")
  
  return <>{children}</>
}
