import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

const handler = async (req: NextRequest, RouteContext: any) => {
  // Dynamically set NEXTAUTH_URL based on the request to support dynamic tunnels
  const protocol = req.headers.get("x-forwarded-proto") || "http"
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  if (host) {
    process.env.NEXTAUTH_URL = `${protocol}://${host}`
  }
  return NextAuth(authOptions)(req as any, RouteContext)
}

export { handler as GET, handler as POST }
