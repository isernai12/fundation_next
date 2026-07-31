"use client"
import React, { useRef, useEffect, useState } from 'react'
import { formatCurrency } from "@/lib/format"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardChartsProps {
  monthlyData: any[]
  groupFundData: any[]
}

import { useTheme } from "next-themes"
import { useLanguage } from "@/i18n/LanguageProvider";

export function DashboardCharts({ monthlyData, groupFundData }: DashboardChartsProps) {
    const { t } = useLanguage();
  const chartRef = useRef<ChartJS<"bar">>(null)
  const [chartData, setChartData] = useState<any>({ datasets: [] })
  
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const textColor = isDark ? "#8B93A3" : "#6b7194"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(213, 217, 232, 0.5)"
  const tooltipBg = isDark ? "#1C1F26" : "#1e2035"

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const mainCtx = chart.ctx

    const gradient1 = mainCtx.createLinearGradient(0, 0, 0, 280)
    gradient1.addColorStop(0, 'rgba(99, 88, 245, 0.15)')
    gradient1.addColorStop(1, 'rgba(99, 88, 245, 0)')

    const gradient2 = mainCtx.createLinearGradient(0, 0, 0, 280)
    gradient2.addColorStop(0, 'rgba(6, 182, 212, 0.1)')
    gradient2.addColorStop(1, 'rgba(6, 182, 212, 0)')

    const labels = monthlyData.map(d => d.month)
    const incomeData = monthlyData.map(d => Number(d.contributions || 0))
    const expenseData = monthlyData.map(d => Number(d.loans || 0) + Number(d.grants || 0))

    setChartData({
      labels,
      datasets: [
        {
          label: 'আয়',
          data: incomeData,
          backgroundColor: 'rgba(99, 88, 245, 0.8)',
          hoverBackgroundColor: 'rgba(99, 88, 245, 1)',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: 'ব্যয়',
          data: expenseData,
          backgroundColor: 'rgba(6, 182, 212, 0.7)',
          hoverBackgroundColor: 'rgba(6, 182, 212, 1)',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        }
      ]
    })
  }, [monthlyData])

  const donutData = {
    labels: groupFundData.map(g => g.name),
    datasets: [{
      data: groupFundData.map(g => g.value),
      backgroundColor: ['#6358f5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
      hoverBackgroundColor: ['#5243e8', '#0891b2', '#d97706', '#059669', '#dc2626', '#7c3aed'],
      borderWidth: 0,
      spacing: 3,
      borderRadius: 4,
    }]
  }

  const activeGroups = groupFundData.filter(g => Number(g.value) > 0).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up delay-10">
      {/* Main Chart */}
      <div className="lg:col-span-2 bg-surface-0 rounded-2xl border border-surface-200 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[15px] font-semibold text-surface-900">{t("dashboard.k_d1166e")}</h3>
            <p className="text-[12px] text-surface-400 mt-0.5">{t("dashboard.k_8fdbb7")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-50 rounded-lg p-0.5 border border-surface-200">
              <button className="px-3 py-1.5 text-[11px] font-semibold bg-surface-0 text-surface-900 rounded-md shadow-sm border border-surface-200">{t("dashboard.k_dc51af")}</button>
              <button className="px-3 py-1.5 text-[11px] font-medium text-surface-500 hover:text-surface-700 rounded-md transition-colors">{t("dashboard.k_647b73")}</button>
              <button className="px-3 py-1.5 text-[11px] font-medium text-surface-500 hover:text-surface-700 rounded-md transition-colors">{t("dashboard.k_f67622")}</button>
            </div>
          </div>
        </div>
        <div className="h-[280px]">
          {chartData.datasets && chartData.datasets.length > 0 && (
            <Bar 
              ref={chartRef}
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 20,
                      font: { size: 12, family: 'Noto Sans Bengali' },
                      color: textColor
                    }
                  },
                  tooltip: {
                    backgroundColor: tooltipBg,
                    titleFont: { family: 'Noto Sans Bengali', size: 13 },
                    bodyFont: { family: 'JetBrains Mono', size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 4,
                    callbacks: {
                      label: function(context) {
                        return context.dataset.label + ': ৳' + (context.parsed.y ?? 0).toLocaleString();
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { size: 11, family: 'Noto Sans Bengali', weight: 'normal' },
                      color: textColor,
                    },
                    border: { display: false }
                  },
                  y: {
                    grid: {
                      color: gridColor,
                    },
                    ticks: {
                      font: { size: 11, family: 'JetBrains Mono' },
                      color: textColor,
                      callback: function(value) { return '৳' + value; },
                      maxTicksLimit: 5,
                    },
                    border: { display: false },
                    beginAtZero: true,
                  }
                }
              }} 
            />
          )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-surface-0 rounded-2xl border border-surface-200 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-surface-900">{t("dashboard.k_5035bb")}</h3>
            <p className="text-[12px] text-surface-400 mt-0.5">{t("dashboard.k_e106a2")}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-[200px] h-[200px]">
            <Doughnut 
              data={donutData} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: '72%',
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: tooltipBg,
                    titleFont: { size: 12, family: 'Noto Sans Bengali', weight: 'bold' },
                    bodyFont: { size: 12, family: 'Noto Sans Bengali' },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ৳' + Number(context.parsed).toLocaleString();
                      }
                    }
                  }
                },
                animation: {
                  animateRotate: true,
                  duration: 1200,
                  easing: 'easeOutQuart' as any
                }
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[28px] font-bold text-surface-950 tracking-tight">{activeGroups}</div>
                <div className="text-[11px] text-surface-400 font-medium">{t("dashboard.k_b427bb")}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {groupFundData.slice(0, 3).map((group, idx) => {
            const colors = ['bg-brand-500', 'bg-accent-cyan', 'bg-accent-amber']
            const totalVal = groupFundData.reduce((acc, curr) => acc + Number(curr.value || 0), 0)
            const perc = totalVal > 0 ? Math.round((Number(group.value) / totalVal) * 100) : 0
            
            return (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50 border border-surface-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></div>
                  <span className="text-[13px] font-medium text-surface-700">{group.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-surface-900">{perc}%</span>
                  <span className="text-[11px] text-surface-400 ml-1">৳{formatCurrency(group.value)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
