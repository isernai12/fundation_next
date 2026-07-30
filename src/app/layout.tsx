import type { Metadata } from "next"
import { Noto_Sans_Bengali } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/components/layout/sidebar-provider"

import { getAuthSession } from "@/lib/auth"

import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "sonner"

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Foundation ERP",
  description: "Foundation Management System",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()
  const user = session?.user as any
  const isLoggedIn = !!user?.id

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.6/index.min.css" rel="stylesheet" />
      </head>
      <body className={`${notoSansBengali.className} h-screen overflow-hidden flex`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              {isLoggedIn && <Sidebar />}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {isLoggedIn && <Header />}
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
