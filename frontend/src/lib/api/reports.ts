import { apiClient } from "./client";

export interface FinancialSummaryReportResponse {
  period?: {
    start_date?: string | null;
    end_date?: string | null;
  };
  overall: {
    monthly_dues_total: number;
    sadaqah_total: number;
    financial_activities_income: number;
    financial_activities_disbursed: number;
    financial_activities_balance: number;
    qard_hasana_disbursed: number;
    qard_hasana_repaid: number;
    qard_hasana_outstanding: number;
    total_liquid_funds: number;
  };
  groups: Array<{
    group_id: string;
    group_code: string;
    group_name: string;
    is_foundation_group: boolean;
    member_count: number;
    dues_collected: number;
    sadaqah_collected: number;
    qard_hasana_disbursed: number;
    qard_hasana_repaid: number;
    current_balance: number;
  }>;
}

export interface DashboardStatsData {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalGroups: number;
  foundationTotalFund: number;
  totalGroupFunds: number;
  currentCashBalance: number;
  totalContributions: number;
  totalActiveLoans: number;
  outstandingLoanAmount: number;
  totalGrants: number;
  totalBeneficiaries: number;
  groupFundDistribution: Array<{ name: string; value: number }>;
  monthlyChartData: Array<{ month: string; contributions: number; loans: number; grants: number }>;
}

export const reportsApi = {
  async getSummary(
    params?: {
      start_date?: string;
      end_date?: string;
    },
    token?: string
  ): Promise<FinancialSummaryReportResponse> {
    return apiClient.get<FinancialSummaryReportResponse>("/api/v1/reports/summary", { params, token });
  },

  async getDashboardStats(token?: string): Promise<DashboardStatsData> {
    return apiClient.get<DashboardStatsData>("/api/v1/reports/dashboard-stats", { token });
  },
};
