"use client";

import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useRbac } from "@/components/providers/rbac-provider";
import { Trans } from "@/components/shared/trans";

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const module = searchParams.get("module");
  const action = searchParams.get("action");
  const { can, permissions } = useRbac();
  const hasDashboardAccess = true;

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
      <div className="bg-red-50 dark:bg-red-950/30 text-red-500 p-5 rounded-full mb-6 shadow-sm border border-red-100 dark:border-red-900/50">
        <ShieldAlert className="w-16 h-16" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3"><Trans tKey="unauthorized.title" fallback="Access Denied" /></h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        <Trans tKey="unauthorized.desc" fallback="You do not have permission to access this page." /></p>

      {(module || action) && (
        <div className="bg-white dark:bg-card rounded-xl p-6 mb-10 w-full max-w-md text-center border shadow-sm">
          <p className="text-sm text-muted-foreground mb-3 font-medium tracking-wide uppercase"><Trans tKey="unauthorized.required_permission" /></p>
          <div className="flex items-center justify-center gap-3">
            <span className="bg-muted px-4 py-1.5 rounded-md font-semibold text-foreground">{module || "অজানা"}</span>
            <span className="text-muted-foreground font-light">→</span>
            <span className="bg-muted px-4 py-1.5 rounded-md font-semibold text-foreground">{action || "অজানা"}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => router.back()}
          className="flex items-center w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <Trans tKey="unauthorized.back" fallback="Go Back" /></Button>
        {hasDashboardAccess && (
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/" className="flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              <Trans tKey="unauthorized.dashboard" fallback="Go to Dashboard" /></Link>
          </Button>
        )}
      </div>

    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[75vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
