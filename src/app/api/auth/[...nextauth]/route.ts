import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

// Initialize NextAuth once to prevent memory leaks
const authHandler = NextAuth(authOptions)

const handler = async (req: NextRequest, ctx: any) => {
  if (process.env.NODE_ENV !== "production") {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
    
    if (host) {
      process.env.NEXTAUTH_URL = `${proto}://${host}`
    }
  }

  // Next.js 15+ passes params as a Promise, but NextAuth v4 expects a synchronous object
  const resolvedParams = await ctx.params;
  const resolvedCtx = { ...ctx, params: resolvedParams };

  return authHandler(req, resolvedCtx)
}

export { handler as GET, handler as POST }
