import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { cache } from "react";
import { authApi } from "@/lib/api/auth";

export const getAuthSession = cache(async () => {
  try {
    return await getServerSession(authOptions);
  } catch (e) {
    return null;
  }
});

const useSecure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days max
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
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("ব্যবহারকারীর নাম বা ইমেইল সঠিক নয়।");
        }

        try {
          const authRes = await authApi.login({
            username: credentials.username.trim(),
            password: credentials.password,
            remember_me: credentials.rememberMe === "true",
          });

          if (!authRes || !authRes.access_token || !authRes.user) {
            throw new Error("ব্যবহারকারীর নাম বা ইমেইল সঠিক নয়।");
          }

          const user = authRes.user;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            image: user.photo,
            photo: user.photo,
            preferences: user.preferences,
            permissions: user.permissions || [],
            accessToken: authRes.access_token,
            expiresAt: Date.now() + (authRes.expires_in || 86400) * 1000,
          } as any;
        } catch (error: any) {
          const message =
            error?.response?.data?.error?.message ||
            error?.response?.data?.detail ||
            error?.message ||
            "ব্যবহারকারীর নাম বা পাসওয়ার্ড সঠিক নয়।";
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.image !== undefined) token.picture = session.image;
        if (session.name !== undefined) token.name = session.name;
        if (session.preferences !== undefined) token.preferences = session.preferences;
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.picture = (user as any).photo || (user as any).image;
        token.preferences = (user as any).preferences;
        token.permissions = (user as any).permissions || [];
        token.accessToken = (user as any).accessToken;
        token.expiresAt = (user as any).expiresAt;
      }

      // Check token expiration
      if (token.expiresAt && Date.now() > (token.expiresAt as number)) {
        return {} as any;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        return session;
      }

      session.user = {
        ...(session.user || {}),
        id: token.id as string,
        name: token.name as string | null | undefined,
        email: token.email as string | null | undefined,
        username: token.username as string | undefined,
        role: token.role as string,
        image: token.picture as string | null | undefined,
        preferences: token.preferences as string | undefined,
        permissions: (token.permissions as string[]) || [],
      } as any;

      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
