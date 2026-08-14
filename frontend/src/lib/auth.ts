import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { getServerSession } from "next-auth/next"
import { cache } from "react"

export const getAuthSession = cache(async () => {
  try {
    return await getServerSession(authOptions)
  } catch (e) {
    return null
  }
})


function parseUserAgent(ua: string) {
  let browser = "Unknown Browser"
  let os = "Unknown OS"
  let device = "Desktop"

  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet"
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera"
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge"
  else if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"
  
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac OS")) os = "MacOS"
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"

  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile"
  } else if (ua.includes("iPad") || ua.includes("Tablet")) {
    device = "Tablet"
  }

  return { browser, os, device }
}

const useSecure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days max global, actual controlled dynamically by jwt token.expiresAt
  },
  cookies: {
    sessionToken: {
      name: useSecure ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
    callbackUrl: {
      name: useSecure ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
    csrfToken: {
      name: useSecure ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecure,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("ব্যবহারকারীর নাম বা ইমেইল সঠিক নয়।")
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          },
          include: { role: true },
        })

        if (!user || user.status !== "ACTIVE") {
          throw new Error("ব্যবহারকারীর নাম বা ইমেইল সঠিক নয়।")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error("পাসওয়ার্ড সঠিক নয়।")
        }

        const rememberMe = credentials.rememberMe === "true"
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days vs 1 day
        const jti = crypto.randomUUID()

        const headers = req?.headers as any
        let userAgent = "Unknown"
        let ip = "Unknown"
        if (headers) {
          userAgent = headers["user-agent"] || (typeof headers.get === 'function' ? headers.get("user-agent") : "Unknown") || "Unknown"
          ip = headers["x-forwarded-for"] || (typeof headers.get === 'function' ? headers.get("x-forwarded-for") : "Unknown") || "Unknown"
        }

        const { browser, os, device } = parseUserAgent(userAgent)

        // Log the login action
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            module: "AUTHENTICATION",
            ipAddress: ip,
            device: device,
            browser: browser,
          }
        })
        
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          image: user.photo,
          jti,
          expiresAt: Date.now() + maxAge,
          browser,
          os,
          device,
          ip,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.image !== undefined) token.picture = session.image
        if (session.name !== undefined) token.name = session.name
      }
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = (user as any).role
        token.picture = (user as any).photo || (user as any).image
        token.sessionId = (user as any).jti
        token.expiresAt = (user as any).expiresAt

        await prisma.userSession.create({
          data: {
            userId: user.id,
            jti: token.sessionId as string,
            device: (user as any).device,
            browser: (user as any).browser,
            os: (user as any).os,
            ipAddress: (user as any).ip,
            expiresAt: new Date((user as any).expiresAt),
          }
        })
      }

      const sessionId = (token.sessionId || token.jti) as string

      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH DEBUG] JWT Callback - User ID: ${token.id}, Role: ${token.role}, Session ID: ${sessionId}`);
      }

      // Check dynamic expiration
      if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
        if (sessionId) {
          await prisma.userSession.deleteMany({ where: { jti: sessionId } }).catch(() => {})
        }
        return {} as any
      }

      // Simple in-memory cache for session validation to avoid DB hits on every request
      const now = Date.now()
      // @ts-ignore - store cache globally to survive HMR in dev
      if (!global.sessionCache) global.sessionCache = new Map<string, { valid: boolean, lastActive: number, checkedAt: number }>()
      // @ts-ignore
      const cacheMap = global.sessionCache as Map<string, { valid: boolean, lastActive: number, checkedAt: number }>

      if (sessionId) {
        const cached = cacheMap.get(sessionId)
        
        if (cached && (now - cached.checkedAt) < 60000) { // 1 minute cache TTL
          if (!cached.valid) {
            return {} as any // Revoked
          }
          if (now - cached.lastActive > 300000) { // 5 minutes lastActive update
            cached.lastActive = now
            prisma.userSession.update({
              where: { jti: sessionId },
              data: { lastActive: new Date() },
            }).catch(() => {})
          }
        } else {
          const session = await prisma.userSession.findUnique({
            where: { jti: sessionId },
            select: { lastActive: true } // Only fetch what we need
          })

          if (!session) {
            cacheMap.set(sessionId, { valid: false, lastActive: 0, checkedAt: now })
            return {} as any // Session revoked via Device Management or password change
          }

          cacheMap.set(sessionId, { valid: true, lastActive: session.lastActive.getTime(), checkedAt: now })

          // Periodically update lastActive (if > 5 minutes old)
          if (now - session.lastActive.getTime() > 300000) {
            const cacheRef = cacheMap.get(sessionId)
            if (cacheRef) cacheRef.lastActive = now
            
            prisma.userSession.update({
              where: { jti: sessionId },
              data: { lastActive: new Date() },
            }).catch(() => {})
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      const sessionId = (token.sessionId || token.jti) as string
      if (!token || !token.id || !sessionId) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[AUTH DEBUG] Session Callback - Invalid token or missing session ID`);
        }
        return session
      }
      session.user = {
        ...(session.user || {}),
        id: token.id as string,
        name: token.name as string | null | undefined,
        role: token.role as string,
        image: token.picture as string | null | undefined,
      } as any
      ;(session as any).jti = sessionId
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH DEBUG] Session Callback - Valid Session for User ID: ${token.id}, Role: ${token.role}`);
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
