import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/components/layout/sidebar-provider"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Foundation ERP",
  description: "Foundation Management System",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen overflow-hidden flex`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              {session && <Sidebar />}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {session && <Header />}
                <main className="flex-1 overflow-auto p-6 bg-muted/20">
                  {children}
                </main>
              </div>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
