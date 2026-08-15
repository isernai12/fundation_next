// Deprecated: Replaced by FastAPI backend endpoints (/api/v1/funds, /api/v1/reports)
export class FinancialService {
  static async getGroupFundSummary(groupId: string) {
    return {
      currentBalance: 0,
      totalFund: 0,
      totalContributions: 0,
      totalDonations: 0,
      totalLoans: 0,
      totalLoanReturns: 0,
      totalGrants: 0,
      totalExpenses: 0,
      memberCount: 0,
      totalTransactions: 0,
    };
  }

  static async getAllGroupSummaries() {
    return [];
  }
}
