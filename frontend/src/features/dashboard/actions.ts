"use server";

import { reportsApi } from "@/lib/api/reports";
import { getAuthSession } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await reportsApi.getDashboardStats(token);
  } catch (error) {
    console.error("[Dashboard] Failed to fetch dashboard stats from FastAPI:", error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      inactiveMembers: 0,
      totalGroups: 0,
      foundationTotalFund: 0,
      totalGroupFunds: 0,
      currentCashBalance: 0,
      totalContributions: 0,
      totalActiveLoans: 0,
      outstandingLoanAmount: 0,
      totalGrants: 0,
      totalBeneficiaries: 0,
      groupFundDistribution: [],
      monthlyChartData: [],
    };
  }
}
