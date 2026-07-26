import React from "react"
import { cn } from "@/lib/utils"

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: React.ReactNode
  subValue?: React.ReactNode
  icon: string
  badgeLabel: React.ReactNode
  badgeIcon?: string
  badgeVariant?: "up" | "down" | "neutral" | "info"
  delayClass?: string
  accentColor?: string
  shadowHover?: string
  dotColor?: string
}

export function KpiCard({
  title,
  value,
  subValue,
  icon,
  badgeLabel,
  badgeIcon,
  badgeVariant = "neutral",
  delayClass,
  accentColor = "#6366f1",
  shadowHover = "rgba(99, 102, 241, 0.1)",
  dotColor = "#6366f1",
  className,
  ...props
}: KpiCardProps) {
  return (
    <div
      className={cn("wm-card animate-fade-up", delayClass, className)}
      style={
        {
          "--card-accent": accentColor,
          "--wm-color": accentColor,
          "--shadow-hover": shadowHover,
          "--dot-color": dotColor,
        } as React.CSSProperties
      }
      {...props}
    >
      <span className="material-symbols-outlined watermark">{icon}</span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="wm-dot"></div>
          <p className="wm-label">{title}</p>
        </div>
        <div className={cn("wm-badge", badgeVariant)}>
          {badgeVariant === "info" ? (
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          ) : badgeIcon ? (
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              {badgeIcon}
            </span>
          ) : null}
          {badgeLabel}
        </div>
      </div>
      <div>
        <p className="wm-value">{value}</p>
        {subValue && <p className="wm-sublabel mt-2">{subValue}</p>}
      </div>
    </div>
  )
}
