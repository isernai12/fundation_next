import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

const handler = async (req: NextRequest, ctx: any) => {
  if (process.env.NODE_ENV !== "production") {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
    
    if (host) {
      process.env.NEXTAUTH_URL = `${proto}://${host}`
    }
  }

  return NextAuth(authOptions)(req, ctx)
}

export { handler as GET, handler as POST }
