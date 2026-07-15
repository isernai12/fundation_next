"use client"

import dynamic from "next/dynamic"

export const DashboardCharts = dynamic(
  () => import("./dashboard-charts").then((mod) => mod.DashboardCharts),
  { ssr: false }
)
