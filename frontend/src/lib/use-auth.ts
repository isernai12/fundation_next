"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { hasPermission as checkPerm, isSuperAdminRole } from "./rbac-client";

export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  permissions?: string[];
}

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const user = useMemo<AuthUser | null>(() => {
    if (!session?.user) return null;
    return {
      id: (session.user as any).id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: (session.user as any).role,
      permissions: (session.user as any).permissions || [],
    };
  }, [session]);

  const role = user?.role || null;
  const isSuperAdmin = useMemo(() => isSuperAdminRole(role), [role]);
  const permissions = user?.permissions || [];

  const hasPermission = (module: string, action: string): boolean => {
    return checkPerm(permissions, module, action, role);
  };

  return {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    hasPermission,
    session,
  };
}
