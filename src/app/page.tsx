import Link from "next/link"
import { Trans } from "@/components/shared/trans"

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card shadow-lg rounded-2xl p-8 text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            <Trans tKey="member-requests.homepage.title" />
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome to the Foundation
          </p>
        </div>

        <div className="grid gap-4">
          <Link 
            href="/member-request" 
            className="flex items-center justify-center w-full h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Trans tKey="member-requests.homepage.becomeMember" />
          </Link>

          <Link 
            href="/member-request/status" 
            className="flex items-center justify-center w-full h-12 px-6 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
          >
            <Trans tKey="member-requests.homepage.checkStatus" />
          </Link>

          <div className="pt-4 grid grid-cols-2 gap-4 border-t">
            <Link 
              href="/about" 
              className="flex items-center justify-center h-10 rounded-md bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
            >
              <Trans tKey="member-requests.homepage.aboutFoundation" />
            </Link>

            <Link 
              href="/activities" 
              className="flex items-center justify-center h-10 rounded-md bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
            >
              <Trans tKey="member-requests.homepage.activities" />
            </Link>
          </div>
          
          <div className="pt-4 border-t">
            <Link 
              href="/login" 
              className="flex items-center justify-center h-10 rounded-md border border-input bg-transparent text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Trans tKey="member-requests.homepage.login" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
